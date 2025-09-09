import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
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
import { resourcesApi, type Language } from '@/src/services/resources';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<string>('en');
  const [password, setPassword] = useState('');
  const [langs, setLangs] = useState<Language[]>([]);
  const [loadingLangs, setLoadingLangs] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await resourcesApi.getLanguages();
        setLangs(list ?? []);
        if (list?.length && !list.find((l) => l.value === language)) {
          setLanguage(list[0].value);
        }
      } catch {
        // keep default 'en'
      } finally {
        setLoadingLangs(false);
      }
    })();
  }, []);

  const valid = useMemo(() => {
    const vEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return name.trim().length >= 2 && vEmail && password.length >= 8;
  }, [name, email, password]);

  const onSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      // 1) Create account
      await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        language,
        password,
      });

      // 3) Persist the email + UX flag
      await SecureStore.setItemAsync('magic_email', email.trim().toLowerCase());
      await SecureStore.setItemAsync('recently_registered', '1');

      // 4) Go to check email
      router.push('/auth/check-email');
    } catch (e: any) {
      const status = e?.status ?? 0;
      const msg = e?.data?.message;
      if (status === 422) setErrorMsg(msg ?? 'Please review your details and try again.');
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
                Create your account
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                You’ll sign in with a magic link
              </Text>
            </View>

            {/* Name */}
            <View className="mb-3">
              <Text className="mb-2 text-sm text-slate-600 dark:text-slate-300">Full name</Text>
              <View className="h-12 flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
                <TextInput
                  className="flex-1 text-slate-900 dark:text-white"
                  placeholder="Jane Doe"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-3">
              <Text className="mb-2 text-sm text-slate-600 dark:text-slate-300">Email</Text>
              <View className="h-12 flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
                <TextInput
                  className="flex-1 text-slate-900 dark:text-white"
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
                />
              </View>
            </View>

            {/* Language */}
            <View className="mb-3">
              <Text className="mb-2 text-sm text-slate-600 dark:text-slate-300">Language</Text>
              <View className="h-12 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
                <Text className="text-slate-900 dark:text-white">
                  {langs.find((l) => l.value === language)?.label ?? language.toUpperCase()}
                </Text>
                <Pressable
                  onPress={() => {
                    if (!langs.length) return;
                    const idx = langs.findIndex((l) => l.value === language);
                    const next = langs[(idx + 1) % langs.length];
                    setLanguage(next.value);
                  }}
                  className="rounded-xl px-3 py-1"
                  style={{ backgroundColor: '#E2E8F0' }}>
                  <Text className="text-xs text-slate-700">Change</Text>
                </Pressable>
              </View>
              {loadingLangs ? (
                <Text className="mt-1 text-xs text-slate-400">Loading languages…</Text>
              ) : null}
            </View>

            {/* Password */}
            <View className="mb-2">
              <Text className="mb-2 text-sm text-slate-600 dark:text-slate-300">Password</Text>
              <View className="h-12 flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
                <TextInput
                  className="flex-1 text-slate-900 dark:text-white"
                  placeholder="At least 8 characters"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPw}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
                <Pressable onPress={() => setShowPw((s) => !s)}>
                  <Text className="text-xs text-slate-500">{showPw ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
            </View>

            {/* Errors */}
            {errorMsg ? <Text className="mt-1 text-xs text-rose-500">{errorMsg}</Text> : null}

            {/* Submit */}
            <Pressable
              onPress={onSubmit}
              disabled={!valid || submitting}
              className={`mt-4 h-12 items-center justify-center rounded-2xl ${
                !valid || submitting ? 'opacity-60' : ''
              }`}
              style={{ backgroundColor: '#19B89A' }}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">Create account</Text>
              )}
            </Pressable>

            {/* Back to sign in */}
            <View className="mt-8 flex-row justify-center">
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
              </Text>
              <Pressable onPress={() => router.replace('/auth/login')}>
                <Text className="text-sm font-medium text-emerald-600">Sign in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
