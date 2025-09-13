import { Link } from 'expo-router';
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';

import AnimatedView from '@/components/AnimatedView';
import Header from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import { vehiclesById } from '@/data/vehicles';
import { useCollapsibleTitle } from '@/src/hooks/useCollapsibleTitle';
// eslint-disable-next-line import/order
import { shadowPresets } from '@/utils/useShadow';

// --- Demo rental history referencing vehicle IDs from vehicles.ts ---
type RentalEntry = {
  id: string;
  vehicleId: string; // must exist in vehicles.ts
  startDate: string; // ISO (YYYY-MM-DD)
  endDate: string; // ISO
  dateLabel: string; // e.g. "15 Aug – 22 Aug, 2025"
};

const rentalHistory: RentalEntry[] = [
  {
    id: 'r-2025-01',
    vehicleId: 'veh-ct-0009',
    startDate: '2025-08-15',
    endDate: '2025-08-22',
    dateLabel: '15 Aug – 22 Aug, 2025',
  },
  {
    id: 'r-2025-02',
    vehicleId: 'veh-ct-0015',
    startDate: '2025-04-05',
    endDate: '2025-04-07',
    dateLabel: '5 Apr – 7 Apr, 2025',
  },
  {
    id: 'r-2024-01',
    vehicleId: 'veh-ct-0001',
    startDate: '2024-09-10',
    endDate: '2024-09-12',
    dateLabel: '10 Sep – 12 Sep, 2024',
  },
  {
    id: 'r-2024-02',
    vehicleId: 'veh-ct-0013',
    startDate: '2024-05-22',
    endDate: '2024-05-25',
    dateLabel: '22 May – 25 May, 2024',
  },
  {
    id: 'r-2023-01',
    vehicleId: 'veh-ct-0021',
    startDate: '2023-12-12',
    endDate: '2023-12-15',
    dateLabel: '12 Dec – 15 Dec, 2023',
  },
  {
    id: 'r-2022-01',
    vehicleId: 'veh-ct-0017',
    startDate: '2022-07-08',
    endDate: '2022-07-10',
    dateLabel: '8 Jul – 10 Jul, 2022',
  },
];

// Group by year (derived from endDate)
const rentalsByYear = rentalHistory.reduce<Record<string, RentalEntry[]>>((acc, entry) => {
  const year = new Date(entry.endDate).getFullYear().toString();
  (acc[year] ||= []).push(entry);
  return acc;
}, {});

// Helper: compute day span (min 1)
const daysBetween = (startIso: string, endIso: string) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};

const TripsScreen = () => {
  const { scrollY, scrollHandler, scrollEventThrottle } = useCollapsibleTitle();

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header title="History" variant="collapsibleTitle" scrollY={scrollY} />
      <AnimatedView animation="scaleIn" className="flex-1">
        <ThemeScroller
          className="pt-4"
          onScroll={scrollHandler}
          scrollEventThrottle={scrollEventThrottle}>
          {Object.entries(rentalsByYear)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, rentals], index) => (
              <View key={year}>
                {index > 0 && <YearDivider year={year} />}
                {rentals.map((rental) => {
                  const v = vehiclesById[rental.vehicleId];
                  const title = v?.title ?? 'Vehicle';
                  const image = v?.image ?? require('@/assets/img/room-1.avif');

                  // Build params for trip-detail
                  const days = daysBetween(rental.startDate, rental.endDate);
                  const reservationNumber = `#RES-${rental.id.toUpperCase()}`;

                  return (
                    <HistoryCard
                      key={rental.id}
                      title={title}
                      image={image}
                      date={rental.dateLabel}
                      vehicleId={rental.vehicleId}
                      startDate={rental.startDate}
                      endDate={rental.endDate}
                      days={days}
                      reservationNumber={reservationNumber}
                    />
                  );
                })}
              </View>
            ))}
        </ThemeScroller>
      </AnimatedView>
    </View>
  );
};

const YearDivider = (props: { year: string }) => {
  return (
    <View className="mb-4 w-full items-center justify-center">
      <View className="h-4 w-px bg-gray-300 dark:bg-gray-800" />
      <ThemedText className="my-1 text-base text-gray-500">{props.year}</ThemedText>
      <View className="h-4 w-px bg-gray-300 dark:bg-gray-800" />
    </View>
  );
};

const HistoryCard = (props: {
  title: string;
  image: any;
  date: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  days: number;
  reservationNumber: string;
}) => {
  const href =
    `/screens/trip-detail` +
    `?id=${encodeURIComponent(props.vehicleId)}` +
    `&start=${encodeURIComponent(props.startDate)}` +
    `&end=${encodeURIComponent(props.endDate)}` +
    `&days=${encodeURIComponent(String(props.days))}` +
    `&res=${encodeURIComponent(props.reservationNumber)}`;

  return (
    <View className="relative">
      <Link asChild href={href}>
        <TouchableOpacity
          style={{ ...shadowPresets.large }}
          activeOpacity={0.8}
          className="mb-4 flex w-full flex-row items-center rounded-2xl bg-light-primary p-2 dark:bg-dark-secondary">
          <Image source={props.image} className="h-20 w-20 rounded-xl" />
          <View className="px-4">
            <ThemedText className="text-base font-bold">{props.title}</ThemedText>
            <ThemedText className="text-xs text-gray-500">{props.date}</ThemedText>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default TripsScreen;
