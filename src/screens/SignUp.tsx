import { useState } from "react";
import { VStack, Image, Center, Text, Heading, ScrollView, useToast, Toast, ToastTitle, ToastDescription } from "@gluestack-ui/themed"
import { useForm, Controller } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';

import BackgroudImg from "@assets/background.png"
import Logo from "@assets/logo.svg";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { api } from "../service/api";

import { useNavigation } from "@react-navigation/native";
import { AuthNavigatorRoutesProps } from "@routes/auth.routes";
import { AppError } from "@utils/AppError";
import { ToastMessage } from "@components/ToastMessage";
import { useAuth } from "@hooks/useAuth";

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

const signUpSchema = yup.object({
    name: yup.string().required('Informe o nome'),
    email: yup.string().required('Informe o email').email('E-mail inválido'),
    password: yup.string().required('Informe a senha').min(6, 'A senha deve ter pelo menos 6 dígitos'),
    passwordConfirm: yup.string()
        .oneOf([yup.ref('password'), ""], 'As senhas devem corresponder')
        .required('Confirme a senha'),
})

export function SignUp() {
    const { signIn } = useAuth();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<AuthNavigatorRoutesProps>()
    const handleGoback = () => navigation.goBack();

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema)
    });

    const handleSignUp = async ({ name, email, password }: FormDataProps) => {

        try {
            setIsLoading(true);

            await api.post('/users', { name, email, password });

            await signIn(email, password);

        } catch (error) {
            setIsLoading(false);
            const isAppError = error instanceof AppError;
            const message: string = isAppError ? error.message : 'Não foi possível criar a conta. Tente novamente mais tarde.';

            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title={message}
                    />
                )
            })
        }
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}>
            <VStack flex={1}>
                <Image
                    source={BackgroudImg}
                    alt="Pessoas treinando"
                    w="$full"
                    h={624}
                    defaultSource={BackgroudImg}
                    position="absolute"
                />
                <VStack flex={1} px="$10" pb="$16">
                    <Center my="$24" >
                        <Logo />
                        <Text color="$gray100" fontSize="$sm" >
                            Treine a sua mente e o seu corpo.
                        </Text>
                    </Center>
                    <Center gap="$2" flex={1}>
                        <Heading color="$gray100">
                            Crie sua conta
                        </Heading>

                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Nome"
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="E-mail"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.email?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Senha"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.password?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="passwordConfirm"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Confirme a senha"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    value={value}
                                    onSubmitEditing={handleSubmit(handleSignUp)}
                                    returnKeyType="send"
                                    errorMessage={errors.passwordConfirm?.message}
                                />
                            )}
                        />
                        <Button title="Criar e acessar" onPress={handleSubmit(handleSignUp)} isLoading={isLoading} />
                    </Center>

                    <Button title="Voltar para login" variant="outline" mt="$12" onPress={handleGoback} />

                </VStack>
            </VStack>
        </ScrollView>
    )
}