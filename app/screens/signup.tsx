import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add lowercase letter');
    }

    // Numbers or special characters check
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add number or special character');
    }

    setPasswordStrength(strength);
    setStrengthText(feedback.join(' • ') || 'Strong password!');
    return strength >= 75;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    const isStrong = checkPasswordStrength(password);
    if (!isStrong) {
      setPasswordError('Please create a stronger password');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignup = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to home screen after successful login
        router.replace('/(drawer)/(tabs)/');
      }, 1500);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
  };

  return (
    <>
      <Header showBackButton />
      <View className="flex-1 bg-light-primary p-6 dark:bg-dark-primary">
        <View className="mt-8">
          <ThemedText className="mb-1 text-3xl font-bold">Create new account</ThemedText>
          <ThemedText className="mb-14 text-light-subtext dark:text-dark-subtext">
            Create an account to continue
          </ThemedText>

          <Input
            label="Email"
            //leftIcon="mail"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) validateEmail(text);
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            containerClassName="mb-4"
          />

          <Input
            label="Password"
            //leftIcon="lock"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              checkPasswordStrength(text);
              if (passwordError) validatePassword(text);
            }}
            error={passwordError}
            isPassword
            autoCapitalize="none"
            containerClassName="mb-4"
          />

          <Input
            label="Confirm password"
            //leftIcon="lock"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmPasswordError) validateConfirmPassword(text);
            }}
            error={confirmPasswordError}
            containerClassName="mb-4"
            isPassword
            autoCapitalize="none"
          />
          {password.length > 0 && (
            <View className="mb-4">
              <View className="h-1 w-full overflow-hidden rounded-full bg-light-secondary dark:bg-dark-secondary">
                <View
                  className={`h-full rounded-full ${passwordStrength >= 75 ? 'bg-green-500' : passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </View>
              <ThemedText className="mt-1 text-xs text-light-subtext dark:text-dark-subtext">
                {strengthText}
              </ThemedText>
            </View>
          )}

          <Button
            title="Sign up"
            onPress={handleSignup}
            loading={isLoading}
            size="large"
            className="mb-6"
          />

          <View className="flex-row justify-center">
            <ThemedText className="text-light-subtext dark:text-dark-subtext">
              Already have an account?{' '}
            </ThemedText>
            <Link href="/screens/login" asChild>
              <Pressable>
                <ThemedText className="underline">Log in</ThemedText>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
});
