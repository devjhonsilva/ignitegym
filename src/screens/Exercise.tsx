import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useToast, Text, VStack, Icon, HStack, Heading, Image, Box } from "@gluestack-ui/themed";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigationRoutesProps } from "@routes/app.routes";

import BodySvg from "@assets/body.svg";
import SeriesSvg from "@assets/series.svg";
import RepetitionSvg from "@assets/repetitions.svg";
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { ToastMessage } from "@components/ToastMessage";
import { api } from "../service/api";
import { ExercisesDTO } from "@dtos/ExercisesDTO";
import { Loading } from "@components/Loading";

type RouteParamsProps = {
    exerciseId: string;
}

export function Exercise() {
    const navigation = useNavigation<AppNavigationRoutesProps>();
    const toast = useToast();
    const route = useRoute();
    const [isLoading, setIsLoading] = useState(true);
    const [sendingRegister, setSendingRegister] = useState(false);
    const [exercise, setExercise] = useState<ExercisesDTO>({} as ExercisesDTO);

    const { exerciseId } = route.params as RouteParamsProps;

    const handleGoback = () => navigation.goBack();

    const fetchExerciseDetails = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/exercises/${exerciseId}`);
            setExercise(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar detalhes do exercício.';
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
        } finally {
            setIsLoading(false);
        }
    };

    async function handleExerciseHistoryRegister(exerciseId: string) {
        try {
            setSendingRegister(true);
            await api.post('/history', { exercise_id: exerciseId });

            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="success"
                        title= "Registro no histórico com sucesso!"
                    />
                )
            });            

            setTimeout(() => {
                navigation.navigate('history');
            },2000)
        } catch (error) {
            console.log(error);
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível registrar o exercício.';
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
        } finally {
            setSendingRegister(false);
        }
    }

    useEffect(() => {
        fetchExerciseDetails();
    }, []);

    return (
        <VStack flex={1}>
            <VStack px="$8" bg="$gray600" pt="$12">
                <TouchableOpacity onPress={handleGoback}>
                    <Icon as={ArrowLeft} color="$green500" size="xl" />
                </TouchableOpacity>
                <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    mt="$4"
                    mb="$8"
                >
                    <Heading color="$gray100" fontFamily="$heading" fontSize="$lg" flexShrink={1} >
                        {exercise.name}
                    </Heading>
                    <HStack alignItems="center" >
                        <BodySvg />
                        <Text color="$gray200" ml="$1" textTransform="capitalize">{exercise.group}</Text>
                    </HStack>
                </HStack>
            </VStack>
            {
                isLoading ? <Loading /> :
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 32 }}
                    >
                        <VStack p="$8">
                            <Box mb="$3" rounded="$lg" overflow="hidden" >
                                <Image
                                    source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                                    alt="Exercício"
                                    resizeMode="cover"
                                    rounded="$lg"
                                    w="$full"
                                    h="$80"
                                />
                            </Box>

                            <Box bg="$gray600" rounded="$md" pb="$4" px="$4">
                                <HStack alignItems="center" justifyContent="space-around" mb="$6" mt="$5">
                                    <HStack>
                                        <SeriesSvg />
                                        <Text color="$gray200" ml="$2">
                                            {exercise.series} Séries
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <RepetitionSvg />
                                        <Text color="$gray200" ml="$2">
                                            {exercise.repetitions} Repetições
                                        </Text>
                                    </HStack>
                                </HStack>

                                <Button
                                    title="Marcar como realizado"
                                    isLoading={sendingRegister}
                                    onPress={() => handleExerciseHistoryRegister(exerciseId)}
                                />
                            </Box>
                        </VStack>
                    </ScrollView>
            }
        </VStack>
    )
}