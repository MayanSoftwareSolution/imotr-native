import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef } from 'react';
import { View, Text, Image, Pressable, Share } from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CardScroller } from '@/components/CardScroller';
import Favorite from '@/components/Favorite';
import Header, { HeaderIcon } from '@/components/Header';
import Icon, { IconName } from '@/components/Icon';
import ImageCarousel from '@/components/ImageCarousel';
import ShowRating from '@/components/ShowRating';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import Switch from '@/components/forms/Switch';
import Divider from '@/components/layout/Divider';
import Section from '@/components/layout/Section';

// 🔗 Use the shared vehicle data
import { vehiclesById, allVehicles } from '@/data/vehicles';

const reviewsData = [
  {
    rating: 5,
    description:
      'Fantastic rental—smooth drive and spotless interior. Owner was responsive and flexible on pickup.',
    date: 'June 2023',
    username: 'John D.',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    rating: 5,
    description:
      'Everything as listed. Loved the Bluetooth + CarPlay for our trip along Chapman’s Peak.',
    date: 'May 2023',
    username: 'Maria S.',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    rating: 4,
    description: 'Great value. Easy handover in Sea Point and the car was fuel-efficient.',
    date: 'April 2023',
    username: 'David L.',
    avatar: 'https://randomuser.me/api/portraits/men/63.jpg',
  },
  {
    rating: 5,
    description: 'Perfect for a weekend getaway. Would rent again—super clean and reliable.',
    date: 'March 2023',
    username: 'Jennifer K.',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
  },
];

const PropertyDetail = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  // Fallback to first vehicle if no id provided
  const vehicle = (id && vehiclesById[id]) || allVehicles[0];

  const [instantBook, setInstantBook] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const insets = useSafeAreaInsets();

  // Derived display bits
  const title = vehicle ? `${vehicle.make} ${vehicle.model} • ${vehicle.locationArea}` : 'Vehicle';
  const priceDisplay = vehicle?.priceDisplay ?? 'R 0/day';
  const ratingOverall = vehicle?.rating ?? 4.6;
  const reviewsCount = 234; // demo value to match your original UI
  const images = vehicle ? [vehicle.image] : [];

  // Manage status bar based on screen focus
  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  const handleShare = async () => {
    if (!vehicle) return;
    try {
      await Share.share({
        message: `Check out this vehicle: ${vehicle.make} ${vehicle.model} in ${vehicle.locationArea}\nPrice: ${priceDisplay}`,
        title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const rightComponents = [
    <Favorite productName={title} size={25} isWhite key="fav" />,
    <HeaderIcon icon="Share2" onPress={handleShare} isWhite href="0" key="share" />,
  ];

  return (
    <>
      {isFocused && <StatusBar style="light" translucent />}
      <Header variant="transparent" title="" rightComponents={rightComponents} showBackButton />
      <ThemedScroller className="bg-light-primary px-0 dark:bg-dark-primary">
        <ImageCarousel images={images} height={500} paginationStyle="dots" />

        <View
          style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30 }}
          className="-mt-[30px] bg-light-primary p-global dark:bg-dark-primary">
          <View>
            <ThemedText className="text-center text-3xl font-semibold">{title}</ThemedText>
            <View className="mt-4 flex-row items-center justify-center">
              <ShowRating
                rating={ratingOverall}
                size="lg"
                className="border-r border-neutral-200 px-4 py-2 dark:border-dark-secondary"
              />
              <ThemedText className="px-4 text-base">{reviewsCount} Reviews</ThemedText>
            </View>
          </View>

          {/* Owner summary (placeholder owner info for demo) */}
          <View className="mb-8 mt-8 flex-row items-center border-y border-neutral-200 py-global dark:border-dark-secondary">
            <Avatar
              size="md"
              src={require('@/assets/img/user-3.jpg')}
              className="mr-4"
              link="/screens/user-profile"
            />
            <View className="ml-0">
              <ThemedText className="text-base font-semibold">Listed by Verified Owner</ThemedText>
              <View className="flex-row items-center">
                <Icon name="MapPin" size={12} className="mr-1" />
                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                  {vehicle.locationArea}, Cape Town
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Description */}
          <ThemedText className="text-base">
            {vehicle.year} • {vehicle.color} • {vehicle.transmission} • {vehicle.fuelType}
          </ThemedText>

          <Divider className="mb-4 mt-8" />

          {/* Vehicle Details */}
          <Section title="Vehicle Details" titleSize="lg" className="mb-6 mt-2">
            <View className="mt-3">
              <FeatureItem icon="Users" label="Seats" value={`${vehicle.seats}`} />
              <FeatureItem icon="DoorClosed" label="Doors" value={`${vehicle.doors}`} />
              <FeatureItem icon="Gauge" label="Transmission" value={vehicle.transmission} />
              <FeatureItem icon="Droplet" label="Fuel" value={vehicle.fuelType} />
              <FeatureItem icon="Calendar" label="Year" value={`${vehicle.year}`} />
              <FeatureItem icon="Palette" label="Colour" value={vehicle.color} />
              <FeatureItem icon="Car" label="Type" value={vehicle.type} />
            </View>
          </Section>

          <Divider className="my-4" />

          {/* Instant Book Option */}
          <View className="flex-row items-center justify-between">
            <Switch
              icon="Zap"
              label="Instant Book Available"
              description="Book immediately without waiting for owner approval"
              value={instantBook}
              onChange={setInstantBook}
              className="flex-1 py-3"
            />
          </View>

          <Divider className="my-4" />

          {/* Ratings & Reviews */}
          <Section
            title="Renter Reviews"
            titleSize="lg"
            subtitle={`${reviewsCount} reviews`}
            className="mb-6">
            <View className="mt-4 rounded-lg bg-light-secondary p-4 dark:bg-dark-secondary">
              <View className="mb-4 flex-row items-center">
                <ShowRating rating={ratingOverall} size="lg" />
                <ThemedText className="ml-2 text-light-subtext dark:text-dark-subtext">
                  ({reviewsCount})
                </ThemedText>
              </View>

              <View className="space-y-2">
                <RatingItem label="Cleanliness" rating={4.8} />
                <RatingItem label="Location" rating={5.0} />
                <RatingItem label="Value for Money" rating={4.7} />
              </View>
            </View>

            <ThemedText className="mb-3 mt-6 text-lg font-semibold">Latest Reviews</ThemedText>
            <CardScroller className="mt-1" space={10}>
              {reviewsData.map((review, index) => (
                <View
                  key={index}
                  className="w-[280px] rounded-lg bg-light-secondary p-4 dark:bg-dark-secondary">
                  <View className="mb-2 flex-row items-center">
                    <Image
                      source={{ uri: review.avatar }}
                      className="mr-2 h-10 w-10 rounded-full"
                    />
                    <View>
                      <ThemedText className="font-medium">{review.username}</ThemedText>
                      <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                        {review.date}
                      </ThemedText>
                    </View>
                  </View>
                  <ShowRating rating={review.rating} size="sm" className="mb-2" />
                  <ThemedText className="text-sm">{review.description}</ThemedText>
                </View>
              ))}
            </CardScroller>
          </Section>
        </View>
      </ThemedScroller>

      {/* Bottom Booking Bar */}
      <View
        style={{ paddingBottom: insets.bottom }}
        className="flex-row items-center justify-start border-t border-neutral-200 px-global pt-4 dark:border-dark-secondary">
        <View>
          <ThemedText className="text-xl font-bold">{priceDisplay}</ThemedText>
          <ThemedText className="text-xs opacity-60">Pick-up & return dates</ThemedText>
        </View>
        <View className="ml-auto flex-row items-center">
          <Button
            title="Reserve"
            className="ml-6 bg-highlight px-6"
            textClassName="text-white"
            size="medium"
            href={`/screens/order-detail?id=${vehicle.id}&start=2025-10-12&end=2025-10-15&passengers=4`}
            rounded="lg"
          />
        </View>
      </View>
    </>
  );
};

// Feature Item Component
interface FeatureItemProps {
  icon: IconName;
  label: string;
  value: string;
}

const FeatureItem = ({ icon, label, value }: FeatureItemProps) => (
  <View className="flex-row items-center py-4">
    <Icon name={icon} size={24} strokeWidth={1.5} className="mr-3" />
    <ThemedText className="flex-1">{label}</ThemedText>
    <ThemedText className="font-medium">{value}</ThemedText>
  </View>
);

// Rating Item Component
interface RatingItemProps {
  label: string;
  rating: number;
}

const RatingItem = ({ label, rating }: RatingItemProps) => (
  <View className="flex-row items-center justify-between py-2">
    <ThemedText className="text-sm">{label}</ThemedText>
    <View className="flex-row items-center">
      <ShowRating rating={rating} size="sm" />
    </View>
  </View>
);

export default PropertyDetail;
