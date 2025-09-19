import { Redirect } from 'expo-router';

export default function Index() {
  const isLoggedIn = false; // luego lo cambias por tu estado real de auth

  return <Redirect href="/(tabs)/home" />;
}