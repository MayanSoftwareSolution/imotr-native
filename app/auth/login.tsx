// app/auth/login.tsx
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Mail } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { authApi } from '@/src/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailValid = useMemo(() => {
    const v = email.trim();
    return v.length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [email]);

  const handleSendLink = async () => {
    if (!emailValid || submitting) return;

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await authApi.requestMagicLink(email);

      // Persist plain token + expiry + the email we used
      if (res.token) await SecureStore.setItemAsync('magic_plain', String(res.token));
      if (res.expires_at)
        await SecureStore.setItemAsync('magic_expires_at', String(res.expires_at));
      await SecureStore.setItemAsync('magic_email', email.trim().toLowerCase());

      router.push('/auth/check-email');
    } catch (e: any) {
      const status = e?.status ?? 0;
      const msg = e?.data?.message;

      if (status === 422) setErrorMsg(msg ?? 'Please enter a valid email address.');
      else if (status === 429) setErrorMsg(msg ?? 'Too many requests. Try again soon.');
      else setErrorMsg(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6">
            {/* Brand header */}
            <View className="mb-10 items-center">
              <View
                className="h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: '#19B89A' }}>
                <Text className="text-2xl font-bold text-white">i</Text>
              </View>
              <Text className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                Sign in with email
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                We’ll email you a secure sign-in link
              </Text>
            </View>

            {/* Email field */}
            <View className="mb-2">
              <Text className="mb-2 text-sm text-slate-600 dark:text-slate-300">Email</Text>
              <View className="h-12 flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
                <Mail size={20} color="#94a3b8" />
                <TextInput
                  className="ml-2 flex-1 text-slate-900 dark:text-white"
                  placeholder="you@imotr.app"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  returnKeyType="send"
                  onSubmitEditing={handleSendLink}
                />
              </View>
              {!emailValid && email.length > 0 ? (
                <Text className="mt-1 text-xs text-rose-500">Enter a valid email.</Text>
              ) : errorMsg ? (
                <Text className="mt-1 text-xs text-rose-500">{errorMsg}</Text>
              ) : null}
            </View>

            {/* Primary: Send link */}
            <Pressable
              onPress={handleSendLink}
              disabled={!emailValid || submitting}
              className={`mt-4 h-12 items-center justify-center rounded-2xl ${
                !emailValid || submitting ? 'opacity-60' : ''
              }`}
              style={{ backgroundColor: '#19B89A' }}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">Sign In With Email</Text>
              )}
            </Pressable>

            {/* Secondary: Create account */}
            <Pressable
              onPress={() => router.push('/auth/register')}
              className="mt-3 h-12 items-center justify-center rounded-2xl border border-slate-300 dark:border-slate-700"
              style={{ backgroundColor: 'transparent' }}>
              <Text className="text-base font-semibold text-slate-900 dark:text-white">
                Create an account
              </Text>
            </Pressable>

            {/* Footer hint */}
            <View className="mt-8 items-center">
              <Text className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                Tap the link in your email to finish signing in. This link is single-use and expires
                shortly.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
