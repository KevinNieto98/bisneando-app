import { Redirect } from 'expo-router';

export default function Index() {
  const isLoggedIn = false; // luego lo cambias por tu estado real de auth

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}