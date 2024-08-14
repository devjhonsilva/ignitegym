import { StatusBar, View } from 'react-native';

import { useFonts, Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto";
import { GluestackUIProvider, Center, Text } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })
  return (
    <GluestackUIProvider config={config}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {fontsLoaded ?
        <Center flex={1} bgColor="$amber100">
          <Text>Home</Text>
        </Center> : <View />}

    </GluestackUIProvider>
  );
}