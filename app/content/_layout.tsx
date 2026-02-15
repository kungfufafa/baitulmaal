import { Stack } from 'expo-router';

export default function ContentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="news" />
      <Stack.Screen name="videos" />
      <Stack.Screen name="article" />
    </Stack>
  );
}
