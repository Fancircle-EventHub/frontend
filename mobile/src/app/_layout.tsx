import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeStateProvider } from '../../NativeState';
export default function RootLayout(){return <SafeAreaProvider><NativeStateProvider><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:'#141416'}}}/></NativeStateProvider></SafeAreaProvider>;}
