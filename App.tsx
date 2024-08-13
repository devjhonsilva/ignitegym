import { StatusBar, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{alignItems:"center", justifyContent:"center", flex:1, backgroundColor:"#202024"}}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    </View>
  );
}