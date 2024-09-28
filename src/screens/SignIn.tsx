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
    email: string;
    password: string;
}

const signUpSchema = yup.object({
    email: yup.string().required('Informe o email').email('E-mail inválido'),
    password: yup.string().required('Informe a senha').min(6, 'A senha deve ter pelo menos 6 dígitos'),
})

export function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const {signIn} = useAuth();

    const navigation = useNavigation<AuthNavigatorRoutesProps>()

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema)
    });


    const handleNewAccount = () => navigation.navigate("signUp");

    const handleSignIn = async ({email, password}: FormDataProps) => {

       try{
        setIsLoading(true)
        await signIn(email, password);
       } catch(error){
            const isAppError = error instanceof AppError;

            setIsLoading(false);

            const title = isAppError ? error.message : 'Não foi possível entrar, tente novamente mais tarde.'
            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title={title}
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

                        <Button title="Acessar" onPress={handleSubmit(handleSignIn)} isLoading={isLoading} />
                    </Center>

                    <VStack alignItems="center">
                        <Text color="$gray100" fontFamily="$body">Ainda não tem acesso?</Text>
                        <Button title="Criar conta" variant="outline" mt="$3" onPress={handleNewAccount} />
                    </VStack>

                </VStack>
            </VStack>
        </ScrollView>
    )
}