import { Redirect } from 'expo-router';
import { SafeAreaView, Text } from 'react-native';

export default function HomeScreen() {

    const isLoggedIn = false; // luego lo cambias por tu estado real de auth
  
    if (!isLoggedIn) {
      return <Redirect href="/(auth)/login" />;
    }
  
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl font-bold text-blue-600">
        Hola Profile
      </Text>
    </SafeAreaView>
  );
}
