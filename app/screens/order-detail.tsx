import { useLocalSearchParams, router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { View, ScrollView, Image, Pressable } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedView from '@/components/AnimatedView';
import { Button } from '@/components/Button';
import DateRangeCalendar from '@/components/DateRangeCalendar';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import ShowRating from '@/components/ShowRating';
import ThemedText from '@/components/ThemedText';
import Divider from '@/components/layout/Divider';
import Section from '@/components/layout/Section';
import { vehiclesById } from '@/data/vehicles';

// --- Helpers ---
const toZAR = (n: number) => `R ${Number(n).toLocaleString('en-ZA')}`;
const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};
const diffDays = (start?: string, end?: string) => {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
  const ms = e.getTime() - s.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
};

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, start, end, passengers } = useLocalSearchParams<{
    id?: string;
    start?: string;  // YYYY-MM-DD
    end?: string;    // YYYY-MM-DD
    passengers?: string;
  }>();

  const vehicle = id ? vehiclesById[id] : undefined;

  // --- Local, editable state (seeded from params) ---
  const [startDate, setStartDate] = useState<string | undefined>(start);
  const [endDate, setEndDate] = useState<string | undefined>(end);

  const maxPassengers = Math.max(1, (vehicle?.seats ?? 4) - 1);
  const initialPassengers = Math.min(
    maxPassengers,
    Math.max(1, Number.isFinite(Number(passengers)) ? Number(passengers) : 1)
  );
  const [pax, setPax] = useState<number>(initialPassengers);

  // Refs for sheets
  const dateSheetRef = useRef<ActionSheetRef>(null);
  const paxSheetRef  = useRef<ActionSheetRef>(null);

  // Derived pricing
  const rentalDays = diffDays(startDate, endDate);
  const dailyRate  = vehicle?.pricePerDay ?? 0;
  const base       = dailyRate * rentalDays;
  const serviceFee = Math.round(base * 0.05);
  const insurance  = Math.round(base * 0.08);
  const taxes      = Math.round(base * 0.12);
  const total      = base + serviceFee + insurance + taxes;

  const canConfirm = Boolean(vehicle && startDate && endDate);
  const reservationNumber = useMemo(() => `#RES-${Date.now().toString().slice(-6)}`, []);

  // Accepts various shapes from DateRangeCalendar
  const onDateRangeChange = (range: any) => {
    const s = range?.startDate ?? range?.start ?? range?.from ?? range?.begin ?? undefined;
    const e = range?.endDate ?? range?.end ?? range?.to ?? range?.finish ?? undefined;
    if (s) setStartDate(s);
    if (e) setEndDate(e);
  };

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header showBackButton title="Confirm and pay" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <AnimatedView animation="fadeIn" duration={400} delay={100}>
          {/* Vehicle Card */}
          <View className="px-global pt-4">
            <View className="rounded-lg border border-neutral-300 p-2 dark:border-dark-neutral-500">
              <View className="flex-row items-center">
                <Image
                  source={vehicle?.image ?? require('@/assets/img/room-2.avif')}
                  className="mr-4 h-20 w-20 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <ThemedText className="text-base font-semibold" numberOfLines={2}>
                    {vehicle ? `${vehicle.make} ${vehicle.model} • ${vehicle.color}` : 'Vehicle not found'}
                  </ThemedText>
                  <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                    {vehicle ? `${vehicle.locationArea}, Cape Town` : ''}
                  </ThemedText>

                  <View className="mt-1 flex-row items-center">
                    <ShowRating rating={vehicle?.rating ?? 4.6} size="sm" />
                    <ThemedText className="ml-2 text-xs text-light-subtext dark:text-dark-subtext">
                      ({Math.floor((vehicle?.rating ?? 4.6) * 40)} reviews)
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Divider className="my-6" />

          {/* Rental Details */}
          <Section title="Your rental" titleSize="lg" className="px-global">
            <View className="mt-4">
              {/* Dates */}
              <View className="flex-row items-center justify-between py-4">
                <View>
                  <ThemedText className="font-semibold">Dates</ThemedText>
                  <ThemedText className="mt-1 text-sm text-light-subtext dark:text-dark-subtext">
                    {fmtDate(startDate)} - {fmtDate(endDate)} ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})
                  </ThemedText>
                </View>
                <Button
                  title="Change"
                  variant="outline"
                  size="small"
                  rounded="lg"
                  onPress={() => dateSheetRef.current?.show()}
                />
              </View>

              <Divider />

              {/* Passengers */}
              <View className="flex-row items-center justify-between py-4">
                <View>
                  <ThemedText className="font-semibold">Passengers</ThemedText>
                  <ThemedText className="mt-1 text-sm text-light-subtext dark:text-dark-subtext">
                    {pax} {pax === 1 ? 'passenger' : 'passengers'} (max {maxPassengers})
                  </ThemedText>
                </View>
                <Button
                  title="Change"
                  variant="outline"
                  size="small"
                  rounded="lg"
                  onPress={() => paxSheetRef.current?.show()}
                />
              </View>
            </View>
          </Section>

          <Divider className="my-6" />

          {/* Cancellation Policy */}
          <Section title="Cancellation policy" titleSize="lg" className="px-global">
            <View className="mt-4 flex-row items-start">
              <Icon name="Shield" size={20} className="mr-3 mt-1 text-green-500" />
              <View className="flex-1">
                <ThemedText className="font-semibold text-green-600 dark:text-green-400">
                  Free cancellation up to 48 hours before pick-up
                </ThemedText>
                <ThemedText className="mt-1 text-sm text-light-subtext dark:text-dark-subtext">
                  Cancel up to 48 hours before your pick-up time for a full refund. After that, a partial refund may apply.
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="my-6" />

          {/* Payment Method (POC: hard-coded, non-interactive) */}
          <Section title="Choose how to pay" titleSize="lg" className="px-global">
            <View className="mt-4 space-y-3">
              {/* Selected method (hard-coded) */}
              <View className="flex-row items-center rounded-lg border border-highlight p-4">
                <Icon name="CreditCard" size={24} className="mr-4" />
                <View className="flex-1">
                  <ThemedText className="font-medium">Visa ending in 1234</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    •••• •••• •••• 1234
                  </ThemedText>
                </View>
                <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-highlight bg-highlight">
                  <View className="h-2 w-2 rounded-full bg-white" />
                </View>
              </View>

              {/* Secondary examples (disabled look, no onPress) */}
              <View className="flex-row items-center rounded-lg border border-light-secondary p-4 opacity-60 dark:border-dark-secondary">
                <Icon name="CreditCard" size={24} className="mr-4" />
                <View className="flex-1">
                  <ThemedText className="font-medium">Mastercard ending in 5678</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    •••• •••• •••• 5678
                  </ThemedText>
                </View>
                <View className="h-5 w-5 rounded-full border-2 border-light-subtext dark:border-dark-subtext" />
              </View>

              <View className="flex-row items-center rounded-lg border border-light-secondary p-4 opacity-60 dark:border-dark-secondary">
                <Icon name="Building2" size={24} className="mr-4" />
                <View className="flex-1">
                  <ThemedText className="font-medium">Online Banking</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Pay with your bank account
                  </ThemedText>
                </View>
                <View className="h-5 w-5 rounded-full border-2 border-light-subtext dark:border-dark-subtext" />
              </View>

              {/* Add payment method (dummy) */}
              <Pressable className="mt-1 flex-row items-center rounded-lg border border-dashed border-light-subtext p-4 dark:border-dark-subtext">
                <Icon name="Plus" size={24} className="mr-4 text-light-subtext dark:text-dark-subtext" />
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Add payment method
                </ThemedText>
              </Pressable>
            </View>
          </Section>

          <Divider className="my-6" />

          {/* Price Details */}
          <Section title="Price details" titleSize="lg" className="px-global">
            <View className="mt-4 space-y-3">
              <View className="flex-row justify-between">
                <ThemedText>
                  {toZAR(dailyRate)} × {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                </ThemedText>
                <ThemedText>{toZAR(base)}</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText>Service fee</ThemedText>
                <ThemedText>{toZAR(serviceFee)}</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText>Insurance</ThemedText>
                <ThemedText>{toZAR(insurance)}</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText>Taxes</ThemedText>
                <ThemedText>{toZAR(taxes)}</ThemedText>
              </View>

              <Divider className="my-3" />

              <View className="flex-row justify-between">
                <ThemedText className="text-lg font-bold">Total (ZAR)</ThemedText>
                <ThemedText className="text-lg font-bold">{toZAR(total)}</ThemedText>
              </View>
            </View>
          </Section>

          {/* Terms */}
          <View className="px-global mt-6">
            <ThemedText className="text-xs leading-5 text-light-subtext dark:text-dark-subtext">
              By selecting the button below, I agree to the Owner’s Rental Rules and platform policies.
              I authorise the platform to charge my payment method for the amount above and any applicable damages per policy.
            </ThemedText>
          </View>
        </AnimatedView>
      </ScrollView>

      {/* Bottom Confirm Button */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-light-secondary bg-light-primary px-global py-4 dark:border-dark-secondary dark:bg-dark-primary"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          title={canConfirm ? 'Confirm and pay' : 'Select dates to continue'}
          className={`w-full ${canConfirm ? 'bg-highlight' : 'bg-light-secondary dark:bg-dark-secondary'}`}
          textClassName={`${canConfirm ? 'text-white font-semibold' : ''}`}
          size="large"
          rounded="lg"
          disabled={!canConfirm}
          onPress={() => {
            if (!vehicle || !startDate || !endDate) return;
            const qs =
              `?id=${encodeURIComponent(String(id))}` +
              `&start=${encodeURIComponent(startDate)}` +
              `&end=${encodeURIComponent(endDate)}` +
              `&days=${encodeURIComponent(String(rentalDays))}` +
              `&total=${encodeURIComponent(String(total))}` +
              `&res=${encodeURIComponent(reservationNumber)}` +
              (pax ? `&passengers=${encodeURIComponent(String(pax))}` : '');
            router.push(`/screens/trip-detail${qs}`);
          }}
        />
      </View>

      {/* === DATE RANGE SHEET === */}
      <ActionSheet
        ref={dateSheetRef}
        gestureEnabled
        containerStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      >
        <View className="p-4">
          <ThemedText className="mb-2 text-lg font-semibold">Select dates</ThemedText>
          <DateRangeCalendar
            minDate={new Date().toISOString().split('T')[0]}
            onDateRangeChange={(range: any) => onDateRangeChange(range)}
            className="mt-2"
          />
          <View className="mt-3 flex-row justify-end">
            <Button title="Done" rounded="lg" onPress={() => dateSheetRef.current?.hide()} />
          </View>
        </View>
      </ActionSheet>

      {/* === PASSENGERS SHEET === */}
      <ActionSheet
        ref={paxSheetRef}
        gestureEnabled
        containerStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      >
        <View className="p-4">
          <ThemedText className="text-lg font-semibold">Passengers</ThemedText>
          <ThemedText className="mt-1 text-sm text-light-subtext dark:text-dark-subtext">
            Maximum {maxPassengers} passengers (excluding driver)
          </ThemedText>

          <View className="mt-4 flex-row items-center justify-between rounded-xl bg-light-secondary px-4 py-3 dark:bg-dark-secondary">
            <Pressable
              onPress={() => setPax((n) => Math.max(1, n - 1))}
              className="h-10 w-10 items-center justify-center rounded-full bg-light-primary dark:bg-dark-primary"
              disabled={pax <= 1}
            >
              <Icon name="Minus" size={20} />
            </Pressable>

            <ThemedText className="text-xl font-semibold">{pax}</ThemedText>

            <Pressable
              onPress={() => setPax((n) => Math.min(maxPassengers, n + 1))}
              className="h-10 w-10 items-center justify-center rounded-full bg-light-primary dark:bg-dark-primary"
              disabled={pax >= maxPassengers}
            >
              <Icon name="Plus" size={20} />
            </Pressable>
          </View>

          <View className="mt-3 flex-row justify-end">
            <Button title="Done" rounded="lg" onPress={() => paxSheetRef.current?.hide()} />
          </View>
        </View>
      </ActionSheet>
    </View>
  );
}
