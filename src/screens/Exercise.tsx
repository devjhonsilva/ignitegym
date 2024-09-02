import { ScrollView, TouchableOpacity } from "react-native";
import { Center, Text, VStack, Icon, HStack, Heading, Image, Box } from "@gluestack-ui/themed";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationRoutesProps } from "@routes/app.routes";

import BodySvg from "@assets/body.svg";
import SeriesSvg from "@assets/series.svg";
import RepetitionSvg from "@assets/repetitions.svg";
import { Button } from "@components/Button";

export function Exercise() {
    const navigation = useNavigation<AppNavigationRoutesProps>();
    const handleGoback = () => {
        navigation.goBack();
    }

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
                        Puxada Frontal
                    </Heading>
                    <HStack alignItems="center" >
                        <BodySvg />
                        <Text color="$gray200" ml="$1" textTransform="capitalize">Costas</Text>
                    </HStack>
                </HStack>
            </VStack>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                <VStack p="$8">
                    <Image
                        source={{ uri: "data:image/jpeg;base64,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" }}
                        alt="Exercício"
                        mb="$3"
                        resizeMode="cover"
                        rounded="$lg"
                        w="$full"
                        h="$80"
                    />

                    <Box bg="$gray600" rounded="$md" pb="$4" px="$4">
                        <HStack alignItems="center" justifyContent="space-around" mb="$6" mt="$5">
                            <HStack>
                                <SeriesSvg />
                                <Text color="$gray200" ml="$2">
                                    3 Séries
                                </Text>
                            </HStack>
                            <HStack>
                                <RepetitionSvg />
                                <Text color="$gray200" ml="$2">
                                    12 Repetições
                                </Text>
                            </HStack>
                        </HStack>

                        <Button title="Marcar como realizado" />
                    </Box>
                </VStack>
            </ScrollView>
        </VStack>
    )
}