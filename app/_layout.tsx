// app/_layout.tsx
import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import React, { useEffect } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { BusinessModeProvider } from '@/src/contexts/BusinesModeContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import useThemedNavigation from '@/src/hooks/useThemedNavigation';

NativeWindStyleSheet.setOutput({ default: 'native' });

function RouterStack() {
  const { screenOptions } = useThemedNavigation();
  const { token, loading, verified, refreshMe } = useAuth();
  const rawSegments = useSegments();
  const segments = Array.from(rawSegments) as string[];

  const router = useRouter();

  // Load /auth/user once we have a token to know verified state
  useEffect(() => {
    if (!loading && token && verified === null) {
      refreshMe();
    }
  }, [loading, token, verified, refreshMe]);

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === 'auth';
    const section = segments.length > 1 ? segments[1] : undefined; // 'login' | 'check-email' | 'verify-email'
    const isVerificationRoute = inAuth && (section === 'verify-email' || section === 'check-email');

    if (!token) {
      // Not logged in: keep all /auth/* accessible, force others to /auth/login
      if (!inAuth) router.replace('/auth/login');
      return;
    }

    // Logged in:
    if (verified === false) {
      // Unverified users must stay in verification routes
      if (!isVerificationRoute) router.replace('/auth/verify-email');
      return;
    }

    if (verified === true && inAuth) {
      // Verified + in /auth/*? Send to app shell
      router.replace('/(tabs)');
    }
    // Else (verified user on app routes): do nothing
  }, [token, loading, verified, segments, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={screenOptions} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      className={`bg-light-primary dark:bg-dark-primary ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`}
      style={{ flex: 1 }}>
      <BusinessModeProvider>
        <ThemeProvider>
          <AuthProvider>
            <RouterStack />
          </AuthProvider>
        </ThemeProvider>
      </BusinessModeProvider>
    </GestureHandlerRootView>
  );
}
