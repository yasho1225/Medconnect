import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { WebPhonePreview } from '@/components/WebPhonePreview';
import { MedConnectProvider } from '@/context/MedConnectContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <MedConnectProvider>
      <RootLayoutNav />
    </MedConnectProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? 'light';

  const navTheme =
    colorScheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: '#0a121f',
            card: '#141e2e',
            primary: '#6ba3ff',
            text: '#f2f6fc',
            border: 'rgba(255,255,255,0.08)',
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: '#eef3fb',
            card: '#ffffff',
            primary: '#3b7eed',
            text: '#0c1629',
            border: 'rgba(15, 34, 58, 0.08)',
          },
        };

  return (
    <ThemeProvider value={navTheme}>
      <WebPhonePreview>
        <View style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={
              Platform.OS === 'web'
                ? {
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#0a121f' : '#eef3fb' },
                  }
                : undefined
            }>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="scan" options={{ headerShown: false }} />
            <Stack.Screen
              name="screening/[id]"
              options={{
                title: 'Screening details',
                headerStyle: { backgroundColor: colorScheme === 'dark' ? '#0F1729' : '#1B2F52' },
                headerTintColor: '#fff',
                headerTitleStyle: { color: '#fff', fontWeight: '800' },
              }}
            />
          </Stack>
        </View>
      </WebPhonePreview>
    </ThemeProvider>
  );
}
