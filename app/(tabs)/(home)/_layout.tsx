// app/(tabs)/(home)/_layout.tsx
import { Stack } from 'expo-router';
import { useRef, createContext } from 'react';
import { View, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeTabs from '@/components/HomeTabs';
import SearchBar from '@/components/SearchBar';

// Create a context to share the scrollY value
export const ScrollContext = createContext<Animated.Value>(new Animated.Value(0));

export default function HomeLayout() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <ScrollContext.Provider value={scrollY}>
      <View
        className="flex-1 bg-light-primary dark:bg-dark-primary"
        style={{ paddingTop: insets.top }}>
        <SearchBar />
        {/*<HomeTabs scrollY={scrollY} />*/}
        <View className="flex-1">
          <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
        </View>
      </View>
    </ScrollContext.Provider>
  );
}
