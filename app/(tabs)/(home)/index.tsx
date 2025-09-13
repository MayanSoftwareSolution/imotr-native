import { router } from 'expo-router';
import React, { useContext } from 'react';
import { View, Pressable, Image, Animated } from 'react-native';

import { ScrollContext } from './_layout';

import AnimatedView from '@/components/AnimatedView';
import Card from '@/components/Card';
import { CardScroller } from '@/components/CardScroller';
import ThemeScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import Section from '@/components/layout/Section';
import { vehicleSections } from '@/data/vehicles';
import { shadowPresets } from '@/utils/useShadow';

const HomeScreen = () => {
  const scrollY = useContext(ScrollContext);

  return (
    <ThemeScroller
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      })}
      scrollEventThrottle={16}>
      <AnimatedView animation="scaleIn" className="mt-4 flex-1">
        {/* Continue Search card */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/screens/map')}
          style={{ ...shadowPresets.large }}
          className="mb-4 flex flex-row items-center rounded-2xl bg-light-primary p-5 dark:bg-dark-secondary">
          <ThemedText className="flex-1 pr-3 text-base font-medium">
            Continue searching for vehicles in Cape Town
          </ThemedText>
          <View className="relative h-20 w-20">
            <View className="relative z-20 h-full w-full overflow-hidden rounded-xl border-2 border-light-primary dark:border-dark-primary">
              <Image
                className="h-full w-full"
                source={require('@/assets/vehicle_images/audi_sedan.avif')}
              />
            </View>
            <View className="absolute left-1 top-0 h-full w-full rotate-12 overflow-hidden rounded-xl border-2 border-light-primary dark:border-dark-primary">
              <Image
                className="h-full w-full"
                source={require('@/assets/vehicle_images/volvo_suv.jpg')}
              />
            </View>
          </View>
        </Pressable>

        {/* Become an Owner card */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/screens/list-vehicle')} // TODO: adjust route if your listing screen differs
          style={{ ...shadowPresets.large }}
          className="mb-8 flex flex-row items-center rounded-2xl bg-light-primary p-5 dark:bg-dark-secondary">
          <View className="flex-1 pr-3">
            <ThemedText className="text-base font-medium">
              Have a spare vehicle you don&apos;t use often? Become an owner and earn extra cash.
            </ThemedText>
          </View>
          <View className="relative h-20 w-20">
            <View className="relative z-20 h-full w-full overflow-hidden rounded-xl border-2 border-light-primary dark:border-dark-primary">
              <Image
                className="h-full w-full"
                source={require('@/assets/vehicle_images/ford_pickup.avif')}
              />
            </View>
          </View>
        </Pressable>

        {vehicleSections.map((section, index) => (
          <Section
            key={`ny-section-${index}`}
            title={section.title}
            titleSize="lg"
            link="/screens/map"
            linkText="View all vehicles">
            <CardScroller space={15} className="mt-1.5 pb-4">
              {section.vehicles.map((vehicle, propIndex) => (
                <Card
                  key={`property-${index}-${propIndex}`}
                  title={vehicle.title}
                  rounded="2xl"
                  hasFavorite
                  rating={4.5}
                  href={`/screens/product-detail?id=${encodeURIComponent(String(vehicle.id))}`}
                  price={vehicle.priceDisplay}
                  width={160}
                  imageHeight={160}
                  image={vehicle.image}
                />
              ))}
            </CardScroller>
          </Section>
        ))}
      </AnimatedView>
    </ThemeScroller>
  );
};

export default HomeScreen;
