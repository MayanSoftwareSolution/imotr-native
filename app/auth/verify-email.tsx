// app/auth/verify-email.tsx
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';

import { useAuth } from '@/src/contexts/AuthContext';
import { authApi } from '@/src/services/auth';

const CODE_LENGTH = 6;
const BRAND = '#19B89A';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { setVerified, logout } = useAuth();

  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  // Load the email we stored at registration / login
  useEffect(() => {
    (async () => {
      const e = await SecureStore.getItemAsync('magic_email');
      setEmail(e);
    })();
  }, []);

  // Auto-send verification code on mount
  useEffect(() => {
    (async () => {
      try {
        await authApi.requestEmailVerification();
        setCooldown(60);
      } catch {
        // ignore first try error; user can tap Resend
      }
    })();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const canSubmit = useMemo(() => /^\d{6}$/.test(code), [code]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    setErrorMsg(null);
    try {
      await authApi.requestEmailVerification();
      setCooldown(60);
    } catch (e: any) {
      setErrorMsg(e?.data?.message ?? 'Could not resend code. Try again.');
    }
  }, [cooldown]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      // Backend expects integer code
      const numeric = Number(code);
      await authApi.submitEmailVerification(numeric);

      // Mark verified before navigating to avoid “flash”
      setVerified(true);

      // Optional: clean temporary flags
      await SecureStore.deleteItemAsync('recently_registered').catch(() => {});

      router.replace('/(tabs)');
    } catch (e: any) {
      const status = e?.status ?? 0;
      const msg = e?.data?.message;
      if (status === 422) setErrorMsg(msg ?? 'Invalid code. Please check and try again.');
      else if (status === 429) setErrorMsg(msg ?? 'Too many attempts. Try again soon.');
      else setErrorMsg(msg ?? 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, code, router, setVerified]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (canSubmit && !submitting) {
      const id = setTimeout(() => handleSubmit(), 75);
      return () => clearTimeout(id);
    }
  }, [canSubmit, submitting, handleSubmit]);

  const onNotYou = useCallback(async () => {
    try {
      await logout(); // revoke token + clear storage
      await SecureStore.deleteItemAsync('magic_email').catch(() => {});
      await SecureStore.deleteItemAsync('magic_plain').catch(() => {});
      await SecureStore.deleteItemAsync('magic_expires_at').catch(() => {});
      await SecureStore.deleteItemAsync('recently_registered').catch(() => {});
    } finally {
      router.replace('/auth/login');
    }
  }, [logout, router]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-1 items-center justify-center px-6">
        {/* Brand badge */}
        <View className="mb-6 items-center">
          <View
            className="h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: BRAND }}>
            <Text className="text-2xl font-bold text-white">i</Text>
          </View>
        </View>

        <Text className="mb-1 text-2xl font-semibold text-slate-900 dark:text-white">
          Verify your email
        </Text>
        <Text className="mb-6 text-center text-slate-600 dark:text-slate-300">
          We sent a 6-digit code to{'\n'}
          <Text className="font-semibold">{email ?? 'your email'}</Text>
        </Text>

        {/* Code input */}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          className="w-full items-center"  // center children horizontally
        >
          <View
            className="mb-3 flex-row justify-center self-center gap-2" // self-center > RN-friendly
          >
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const char = code[i] ?? '';
              const isActive = i === code.length;
              return (
                <View
                  key={i}
                  className={`h-12 w-10 items-center justify-center rounded-xl border ${
                    isActive ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-700'
                  } bg-white dark:bg-slate-900`}
                >
                  <Text className="text-lg font-semibold text-slate-900 dark:text-white">
                    {char ? '•' : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </Pressable>


        {/* Hidden real input */}
        <TextInput
          ref={inputRef}
          keyboardType="number-pad"
          value={code}
          onChangeText={(t) => {
            // digits only, max 6
            const cleaned = t.replace(/\D+/g, '').slice(0, CODE_LENGTH);
            setCode(cleaned);
            if (errorMsg) setErrorMsg(null);
          }}
          autoFocus
          contextMenuHidden
          maxLength={CODE_LENGTH}
          className="h-0 w-0 opacity-0"
        />

        {/* Error/help */}
        {errorMsg ? (
          <Text className="mb-2 text-xs text-rose-500">{errorMsg}</Text>
        ) : (
          <Text className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            Enter the 6-digit code to continue.
          </Text>
        )}

        {/* Resend & Submit */}
        <View className="mt-2 w-full flex-row items-center justify-center gap-12">
          <Pressable
            disabled={cooldown > 0}
            onPress={handleResend}
            className={`rounded-xl px-3 py-2 ${cooldown > 0 ? 'opacity-50' : ''}`}
            style={{ backgroundColor: '#E2E8F0' }}>
            <Text className="text-sm text-slate-700">
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`rounded-xl px-4 py-2 ${!canSubmit || submitting ? 'opacity-60' : ''}`}
            style={{ backgroundColor: BRAND }}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-semibold text-white">Verify</Text>
            )}
          </Pressable>
        </View>

        {/* Not you */}
        <View className="mt-8 items-center">
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            Signed in as {email ?? 'this account'}
          </Text>
          <Pressable onPress={onNotYou}>
            <Text className="mt-1 text-xs font-medium text-emerald-600">Not you?</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
