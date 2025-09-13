import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Platform, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import AnimatedView from '@/components/AnimatedView';
import Avatar from '@/components/Avatar';
import { Button } from '@/components/Button';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import ImageCarousel from '@/components/ImageCarousel';
import ListLink from '@/components/ListLink';
import ShowRating from '@/components/ShowRating';
import ThemedFooter from '@/components/ThemeFooter';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import Divider from '@/components/layout/Divider';
// eslint-disable-next-line import/order
import Section from '@/components/layout/Section';

// Vehicle data
import { vehiclesById } from '@/data/vehicles';

// --- Helpers ---
const fmtDate = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};
const diffDays = (start?: string, end?: string) => {
  if (!start || !end) return undefined;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return undefined;
  const ms = e.getTime() - s.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
};

const RentalDetailScreen = () => {
  // Params you can pass when navigating:
  // /screens/trip-detail?id=veh-ct-0009&start=2025-08-15&end=2025-08-22&days=7&total=2450&res=#RES-789456
  const { id, start, end, days, total, res, drivers, passengers } = useLocalSearchParams<{
    id?: string;
    start?: string; // ISO YYYY-MM-DD
    end?: string; // ISO YYYY-MM-DD
    days?: string; // numeric string
    total?: string; // numeric string (Rands)
    res?: string; // reservation number
    drivers?: string; // optional counts
    passengers?: string;
  }>();

  const vehicle = id ? vehiclesById[id] : undefined;

  const reviewHref =
    `/screens/review?id=${encodeURIComponent(String(id ?? ''))}` +
    (start ? `&start=${encodeURIComponent(start)}` : '') +
    (end ? `&end=${encodeURIComponent(end)}` : '');

  // Derive dates/durations
  const pickUpLabel = fmtDate(start);
  const dropOffLabel = fmtDate(end);
  const calculatedDays = diffDays(start, end);
  const rentalDays = Number(days ?? calculatedDays ?? 1);

  // Price maths (fallbacks if total not provided)
  const dailyRate = vehicle?.pricePerDay ?? 0;
  const subtotal = dailyRate * rentalDays;
  // Simple demo fees (tweak as needed)
  const insuranceFee = Math.round(subtotal * 0.08);
  const serviceFee = Math.round(subtotal * 0.05);
  const taxes = Math.round(subtotal * 0.12);
  const computedTotal = subtotal + insuranceFee + serviceFee + taxes;
  const totalRands = Number.isFinite(Number(total)) ? Number(total) : computedTotal;

  // “Owner” placeholder (vehicles.ts doesn’t have hosts yet)
  const owner = {
    name: 'Verified Owner',
    avatar: require('@/assets/img/user-2.jpg'),
    rating: vehicle?.rating ?? 4.6,
    reviewCount: Math.floor((vehicle?.rating ?? 4.6) * 40),
  };

  // Map region (fallback to Cape Town CBD)
  const region = useMemo(
    () => ({
      latitude: vehicle?.lat ?? -33.9249,
      longitude: vehicle?.lng ?? 18.4241,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    }),
    [vehicle?.lat, vehicle?.lng]
  );

  const openInMaps = () => {
    if (!vehicle?.lat || !vehicle?.lng) return;
    const label = encodeURIComponent(`${vehicle.title} - ${vehicle.locationArea}`);
    const { lat, lng } = vehicle;
    const url =
      Platform.select({
        ios: `maps:0,0?q=${label}&ll=${lat},${lng}`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
        default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      }) || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  if (!vehicle) {
    return (
      <>
        <Header title="Rental Details" showBackButton />
        <ThemedScroller className="flex-1 px-global">
          <Section title="Vehicle not found" titleSize="lg" className="pt-6">
            <ThemedText className="text-light-subtext dark:text-dark-subtext">
              We couldn’t load this vehicle. Please go back and try again.
            </ThemedText>
          </Section>
        </ThemedScroller>
      </>
    );
  }

  return (
    <>
      <Header title="Rental Details" showBackButton />
      <ThemedScroller className="flex-1 px-0" keyboardShouldPersistTaps="handled">
        <AnimatedView animation="fadeIn" duration={400} delay={100}>
          {/* Vehicle Images */}
          <View className="px-global">
            <ImageCarousel height={300} rounded="2xl" images={[vehicle.image]} />
          </View>

          {/* Vehicle Title and Location */}
          <View className="px-global pb-4 pt-6">
            <ThemedText className="mb-2 text-2xl font-bold">{vehicle.title}</ThemedText>
            <View className="flex-row items-center">
              <Icon
                name="MapPin"
                size={16}
                className="mr-2 text-light-subtext dark:text-dark-subtext"
              />
              <ThemedText className="text-light-subtext dark:text-dark-subtext">
                {vehicle.locationArea}, Cape Town
              </ThemedText>
            </View>
          </View>

          <Divider className="h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Owner / Listing Info */}
          <Section title="Listed by" titleSize="lg" className="px-global pt-4">
            <View className="mb-4 mt-4 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <Avatar src={owner.avatar} size="lg" />
                <View className="ml-3 flex-1">
                  <ThemedText className="text-lg font-semibold">{owner.name}</ThemedText>
                  <View className="mt-1 flex-row items-center">
                    <ShowRating rating={owner.rating} size="sm" />
                    <ThemedText className="ml-2 text-sm text-light-subtext dark:text-dark-subtext">
                      ({owner.reviewCount} reviews)
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>

            <ListLink
              icon="MessageCircle"
              title="Message owner"
              description="Get help with your booking"
              href="/screens/chat/user"
              showChevron
              className="rounded-xl bg-light-secondary px-4 py-3 dark:bg-dark-secondary"
            />
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Rental Window */}
          <Section title="Your rental" titleSize="lg" className="px-global pt-4">
            <View className="mt-4 space-y-4">
              <View className="flex-row items-center justify-between rounded-xl bg-light-secondary p-4 dark:bg-dark-secondary">
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Pick-up
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">{pickUpLabel ?? '—'}</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    From 9:00 AM
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Drop-off
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">{dropOffLabel ?? '—'}</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    By 6:00 PM
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-2">
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Duration
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">
                    {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Passengers
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">
                    {passengers ?? vehicle.seats} seats
                  </ThemedText>
                </View>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Booking Details */}
          <Section title="Booking details" titleSize="lg" className="px-global pt-4">
            <View className="mt-4 space-y-3">
              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Reservation number
                </ThemedText>
                <ThemedText className="font-medium">{res ?? '#RES-000000'}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Vehicle
                </ThemedText>
                <ThemedText className="font-medium">
                  {vehicle.make} {vehicle.model} • {vehicle.color} • {vehicle.transmission}
                </ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Fuel / Type
                </ThemedText>
                <ThemedText className="font-medium">
                  {vehicle.fuelType} • {vehicle.type}
                </ThemedText>
              </View>

              <View className="mt-4">
                <ThemedText className="mb-2 text-sm font-medium">Cancellation policy</ThemedText>
                <ThemedText className="text-sm leading-5 text-light-subtext dark:text-dark-subtext">
                  Free cancellation up to 48 hours before pick-up. A partial refund may apply after
                  that window based on owner settings.
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Price Breakdown */}
          <Section title="Price details" titleSize="lg" className="px-global pt-4">
            <View className="mt-4 space-y-3">
              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  R {dailyRate} × {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                </ThemedText>
                <ThemedText>R {subtotal}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Insurance
                </ThemedText>
                <ThemedText>R {insuranceFee}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Service fee
                </ThemedText>
                <ThemedText>R {serviceFee}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">Taxes</ThemedText>
                <ThemedText>R {taxes}</ThemedText>
              </View>

              <Divider className="my-3" />

              <View className="flex-row justify-between">
                <ThemedText className="text-lg font-bold">Total</ThemedText>
                <ThemedText className="text-lg font-bold">R {totalRands}</ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Vehicle Rules & Instructions */}
          <Section title="Rental rules & instructions" titleSize="lg" className="px-global pt-4">
            {/* ... (unchanged content) ... */}
            <View className="mt-4 space-y-4">
              <View className="flex-row items-start">
                <Icon
                  name="Fuel"
                  size={16}
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                />
                <View>
                  <ThemedText className="font-medium">Fuel policy</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Return with the same fuel level as at pick-up.
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-start">
                <Icon
                  name="Gauge"
                  size={16}
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                />
                <View>
                  <ThemedText className="font-medium">Mileage</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    200 km/day included. Additional distance may incur charges.
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-start">
                <Icon
                  name="ShieldCheck"
                  size={16}
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                />
                <View>
                  <ThemedText className="font-medium">Security deposit</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    A refundable deposit may be held at pick-up.
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-start">
                <Icon
                  name="Ban"
                  size={16}
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                />
                <View>
                  <ThemedText className="font-medium">No smoking</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Smoking is not permitted in the vehicle.
                  </ThemedText>
                </View>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Location */}
          <Section title="Pick-up location" titleSize="lg" className="px-global pb-6 pt-4">
            <View className="mt-4">
              <ThemedText className="mb-4 text-light-subtext dark:text-dark-subtext">
                {vehicle.locationArea}, Cape Town
              </ThemedText>

              {/* ✅ Live Map */}
              <View className="h-48 w-full overflow-hidden rounded-xl">
                <MapView className="h-full w-full" initialRegion={region}>
                  <Marker
                    coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                    title={vehicle.title}
                    description={`${vehicle.locationArea}, Cape Town`}
                  />
                </MapView>
              </View>

              <Button
                title="Open in Maps"
                iconStart="ExternalLink"
                variant="outline"
                className="mt-4"
                onPress={openInMaps}
              />
            </View>
          </Section>
        </AnimatedView>
      </ThemedScroller>

      <ThemedFooter>
        <View className="flex-row space-x-3">
          <Button
            title="Review vehicle"
            variant="outline"
            iconStart="Star"
            className="flex-1"
            href={reviewHref}
          />
          <Button
            title="Cancel booking"
            variant="outline"
            iconStart="X"
            className="flex-1"
            onPress={() => console.log('Cancel booking')}
          />
        </View>
      </ThemedFooter>
    </>
  );
};

export default RentalDetailScreen;
