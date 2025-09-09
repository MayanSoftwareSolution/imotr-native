import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, Pressable, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useThemeColors from '@/src/contexts/ThemeColors';

import Icon from '@/components/Icon';
import ThemeToggle from '@/components/ThemeToggle';
import ThemedText from '@/components/ThemedText';

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-light-primary dark:bg-dark-primary">
      <View className="relative flex-1 bg-light-primary dark:bg-dark-primary">
        <View className="w-full flex-row justify-end px-4 pt-2">
          <ThemeToggle />
        </View>

        <View className="flex w-full flex-1 flex-col items-start justify-center gap-2 px-global pb-20">
          <View className="mb-8">
            <ThemedText className="text-4xl font-bold">Welcome back</ThemedText>
            <ThemedText className="text-base text-light-subtext dark:text-dark-subtext">
              Sign in to your account to continue
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/screens/signup')}
            className="flex  w-full flex-row items-center justify-center rounded-2xl border border-black py-4 dark:border-white">
            <View className="top-4.5 absolute left-4">
              <Icon name="Mail" size={20} color={colors.text} />
            </View>
            <ThemedText className="pr-2 text-base font-medium">Continue with Email</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/(home)')}
            className="flex w-full flex-row items-center justify-center rounded-2xl border border-black py-4 dark:border-white">
            <View className="top-4.5 absolute left-4">
              <Icon name="Facebook" size={22} color={colors.text} />
            </View>
            <ThemedText className="pr-2 text-base font-medium">Continue with Facebook</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/(home)')}
            className="flex w-full flex-row items-center justify-center rounded-2xl border border-black py-4 dark:border-white">
            <View className="top-4.5 absolute left-4">
              <AntDesign name="google" size={22} color={colors.text} />
            </View>
            <ThemedText className="pr-2 text-base font-medium">Continue with Google</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/(home)')}
            className="flex w-full flex-row items-center justify-center rounded-2xl border border-black py-4 dark:border-white">
            <View className="top-4.5 absolute left-4">
              <AntDesign name="apple1" size={22} color={colors.text} />
            </View>
            <ThemedText className="pr-2 text-base font-medium">Continue with Apple</ThemedText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
