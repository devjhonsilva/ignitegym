import { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Center, Heading, Text, VStack, onChange, useToast } from "@gluestack-ui/themed";
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

const profileSchema = yup.object({
    name: yup.string().required('Informe o nome.'),
    email: yup.string().required('Informe o e-mail.').email('E-mail inválido.'),
    old_password: yup.string().nullable(),
    new_password: yup.string().min(6, 'A senha deve ter pelo menos 6 dígitos.').nullable(),
    confirm_password: yup.string()
        .oneOf([yup.ref('new_password'), 'null'], 'As senhas não estão iguais!')
        .nullable(),
});

export function Profile() {
    const [userPhoto, setUserPhoto] = useState("https:github.com/devjhonsilva.png")

    const toast = useToast();
    const { user } = useAuth();
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
        },
        resolver: yupResolver(profileSchema)
    });

    async function handleUserPhotoSelect() {
        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
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
                setUserPhoto(photoURI)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleProfileUpdate = async (data: any) => {
        console.log(data)
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt="$6" px="$10" >
                    <UserPhoto
                        source={{ uri: userPhoto }}
                        alt="Foto do usuário"
                        size="xl"
                    />
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
                            name="new_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Nova senha"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry
                                    errorMessage={errors.new_password?.message}
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
                        />
                    </Center>
                </Center>
            </ScrollView>
        </VStack>
    )
}