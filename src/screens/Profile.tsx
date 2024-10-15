import { useState, useRef } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Center, Heading, Text, VStack, useToast } from "@gluestack-ui/themed";
import defaultUserPhotoImg from '@assets/userPhotoDefault.png'
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { ToastMessage } from "@components/ToastMessage";
import { useAuth } from "@hooks/useAuth";
import { Loading } from "@components/Loading";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import axios from "axios";
import mime from 'mime';

type FormDataProps = {
    name: string;
    email?: string;
    old_password: string;
    password: string;
    confirm_password: string | any | undefined;
};

const profileSchema = yup.object({
    name: yup
        .string()
        .required('Informe o nome'),
    email: yup
        .string(),
    old_password: yup
        .string()
        .transform((value) => value === '' ? undefined : value),
    password: yup
        .string()
        .min(6, 'A senha deve ter pelo menos 6 dígitos.')
        .nullable()
        .transform((value) => value === '' ? undefined : value),
    confirm_password: yup
        .string()
        .nullable()
        .transform((value) => value === '' ? undefined : value)
        .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
        .when('password', {
            is: (Field: any) => Field,
            then: (schema) => schema
                .required('Informe a confirmação da senha.')
                .nullable()
                .transform((value) => !!value ? value : null)
                .oneOf([yup.ref('password')], 'A confirmação de senha não confere.'),
            otherwise: (schema) => schema.notRequired(),
        }),
})
type ProfileSchemaType = yup.InferType<typeof profileSchema>;

export function Profile() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const [userPhoto, setUserPhoto] = useState("https:github.com/devjhonsilva.png");

    const toast = useToast();
    const { user, updateUserProfile } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<ProfileSchemaType>({
        defaultValues: {
            name: user.name,
            email: user.email,
        },
        resolver: yupResolver(profileSchema)
    });

    async function handleUserPhotoSelect() {
        try {
            setPhotoIsLoading(true);
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [6, 5],
                allowsEditing: true,
            })

            if (photoSelected.canceled) {
                return
            }

            const photoURI = photoSelected.assets[0].uri

            if (photoURI) {
                const photoInfo = (await FileSystem.getInfoAsync(photoURI)) as {
                    size: number
                }

                if (photoInfo && (photoInfo.size / 1024 / 1024) > 1) {
                    return toast.show({
                        placement: "top",
                        render: ({ id }) => (
                            <ToastMessage
                                id={id}
                                action="error"
                                title="Imagem muito grande!"
                                description="Essa imagem é muito grande, Escolha uma de até 5MB."
                                onClose={() => toast.close(id)}
                            />
                        )
                    })
                }
                const fileExtension = photoURI.split('.').pop();

                const photoFile = {
                    name: `${user.name}.${fileExtension}`.toLowerCase(),
                    uri: photoSelected.assets[0].uri,
                    type: mime.getType(`${photoSelected.assets[0].uri}`)
                } as any;

                const userPhotoUploadForm = new FormData();
                userPhotoUploadForm.append('avatar', photoFile);

                const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
                    headers: {
                           'Content-Type': 'multipart/form-data'
                    },
                });

                const userUpdated = user;
                userUpdated.avatar = avatarUpdatedResponse.data.avatar;
                updateUserProfile(userUpdated);

                toast.show({
                    placement: 'top',
                    render: ({ id }) => (
                        <ToastMessage
                            id={id}
                            action="success"
                            title="Foto atualizada com sucesso!"
                        />
                    )
                })

            }
        } catch (error) {
            console.log('Detalhes do erro de rede:', error);
            if (axios.isAxiosError(error)) {
                console.error('Erro do Axios:', error.response?.data || error.message);
            }
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível atualizar a foto, tente novamente mais tarde.';
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title={title}
                        onClose={() => toast.close(id)}
                    />
                )
            })
        } finally {
            setPhotoIsLoading(false);
        }
    }

    const handleProfileUpdate = async (data: ProfileSchemaType) => {
        try {
            setIsUpdating(true);

            const userUpdated = user;
            userUpdated.name = data.name;

            await api.put('/users', data);

            await updateUserProfile(userUpdated);
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="success"
                        title="Perfil atualizado com sucesso!"
                        onClose={() => toast.close(id)}
                    />
                )
            })
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível atualizar os dados, tente novamente mais tarde.';
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title={title}
                        onClose={() => toast.close(id)}
                    />
                )
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt="$6" px="$10" >
                    {
                        photoIsLoading ? <Loading /> : (
                            <UserPhoto
                            source={user.avatar ? {uri: `${api.defaults.baseURL}/avatar/${user.avatar}`} : defaultUserPhotoImg }
                                alt="Foto do usuário"
                                size="xl"
                            />
                        )
                    }
                    <TouchableOpacity onPress={handleUserPhotoSelect}>
                        <Text color="$green500" fontFamily="$heading" fontSize="$md" mt="$2" mb="$4">
                            Alterar foto</Text>
                    </TouchableOpacity>

                    <Center w="$full" gap="$1" >
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    placeholder="Nome"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    autoCorrect={false}
                                    value={value}
                                    errorMessage={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    placeholder="E-mail"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    value={value}
                                    isReadOnly
                                />
                            )}
                        />
                    </Center>

                    <Heading
                        alignSelf="flex-start" color="$gray200"
                        fontFamily="$heading" fontSize="$md" mt="$5" mb="$5">
                        Alterar senha
                    </Heading>
                    <Center w="$full" gap="$1">
                        <Controller
                            control={control}
                            name="old_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Senha antiga"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry />
                            )}
                        />
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Nova senha"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry
                                    errorMessage={errors.password?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="confirm_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Confirme a senha"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry
                                    errorMessage={errors.confirm_password?.message}
                                />
                            )}
                        />
                        <Button
                            title="Atualizar"
                            onPress={handleSubmit(handleProfileUpdate)}
                            isLoading={isUpdating}
                        />
                    </Center>
                </Center>
            </ScrollView>
        </VStack>
    )
}