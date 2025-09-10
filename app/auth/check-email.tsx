// app/auth/check-email.tsx
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';

import BrandBackdrop from '@/src/components/BrandBackdrop';
import { useAuth } from '@/src/contexts/AuthContext';
import { authApi } from '@/src/services/auth';

type Status = 'idle' | 'verifying' | 'done' | 'error';

export default function CheckEmailScreen() {
  const router = useRouter();
  const { setApiToken } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Load the email we stored on login/register submit
  useEffect(() => {
    (async () => {
      const e = await SecureStore.getItemAsync('magic_email');
      setEmail(e);
    })();
  }, []);

  const afterLoginRoute = useCallback(async () => {
    // decide if we need to verify email first
    const me = await authApi.getUser().catch(() => null);
    if (me && me.email_verified === false) {
      router.replace('/auth/verify-email');
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  const verifyWithToken = useCallback(
    async (token: string) => {
      if (!token) return;
      try {
        setStatus('verifying');
        setError(null);

        const res = await authApi.verifyMagicLink(token); // -> { token, expires_at? }

        // cleanup client-side magic state
        await Promise.all([
          SecureStore.deleteItemAsync('magic_plain'),
          SecureStore.deleteItemAsync('magic_expires_at'),
        ]);

        await setApiToken(res.token); // persists + flips app to authed state
        setStatus('done');

        await afterLoginRoute();
      } catch (e: any) {
        setStatus('error');
        const msg =
          e?.data?.message ??
          (typeof e?.message === 'string' ? e.message : 'Invalid or expired link.');
        setError(msg);
        Alert.alert('Sign-in failed', msg);
      }
    },
    [setApiToken, afterLoginRoute]
  );

  // Handle deep link while app is in foreground + cold start
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      const { queryParams } = Linking.parse(url);
      const token = String(queryParams?.token ?? '');
      if (token) verifyWithToken(token);
    });

    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const token = String(queryParams?.token ?? '');
      if (token) verifyWithToken(token);
    });

    return () => sub.remove();
  }, [verifyWithToken]);

  // Manual flow: user taps button after confirming in email
  const onConfirmed = async () => {
    const stored = await SecureStore.getItemAsync('magic_plain');
    if (!stored) {
      Alert.alert(
        'No pending sign-in',
        'We couldn’t find a pending sign-in token on this device. Please request a new link from the login screen.'
      );
      return;
    }
    await verifyWithToken(stored);
  };

  // “Not you?” → clear email + magic state and return to login
  const onNotYou = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync('magic_plain'),
      SecureStore.deleteItemAsync('magic_expires_at'),
      SecureStore.deleteItemAsync('magic_email'),
    ]);
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <BrandBackdrop cover={0.5} strength={0.22} />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
          Check your email
        </Text>
        <Text className="text-center text-slate-600 dark:text-slate-300">
          We sent you a secure sign-in link{email ? ' to ' : ' '}
        </Text>
        <Text className="font-semibold text-slate-900 dark:text-white">
          {email ?? 'your email'}
        </Text>
        <Text className="text-center text-slate-600 dark:text-slate-300">
          Open your mailbox and tap the link to continue.
        </Text>

        {/* "Not you?" link */}
        <Pressable onPress={onNotYou} className="mt-2">
          <Text className="text-sm font-medium text-emerald-600">Not you?</Text>
        </Pressable>

        <Pressable
          onPress={onConfirmed}
          disabled={status === 'verifying'}
          className={`mt-8 h-12 items-center justify-center rounded-2xl px-6 ${
            status === 'verifying' ? 'opacity-60' : ''
          }`}
          style={{ backgroundColor: '#19B89A' }}>
          {status === 'verifying' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">I’ve confirmed by email</Text>
          )}
        </Pressable>

        <Text className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {status === 'verifying'
            ? 'Verifying your link...'
            : status === 'done'
              ? 'Signed in. Redirecting...'
              : 'This page will pick up the link automatically when you tap it.'}
        </Text>

        {error ? (
          <Text className="mt-2 text-center text-xs text-rose-500">{String(error)}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
