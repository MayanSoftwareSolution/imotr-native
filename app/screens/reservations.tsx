import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';

import { CardScroller } from '@/components/CardScroller';
import { Chip } from '@/components/Chip';
import Header from '@/components/Header';
import ThemedFooter from '@/components/ThemeFooter';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import Section from '@/components/layout/Section';
import { vehiclesById } from '@/data/vehicles';
import { shadowPresets } from '@/utils/useShadow';

type Status = 'upcoming' | 'cancelled' | 'past';

interface VehicleReservation {
  id: string; // reservation id
  vehicleId: string; // must map to vehicles.ts
  startISO: string; // YYYY-MM-DD
  endISO: string; // YYYY-MM-DD
  pickUpLabel: string; // e.g., "Dec 15"
  dropOffLabel: string; // e.g., "Dec 18"
  status: Status;
  statusText: string; // e.g., "Arriving tomorrow"
  days: number;
  passengers: number;
  contactName: string; // owner/renter
  contactAvatar: string; // URL (optional)
}

// --- helpers ---
const fmtMMMd = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
const diffDays = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.getTime() - s.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
};

// Demo data linked to vehicles.ts
const baseReservations: VehicleReservation[] = [
  {
    id: 'res-001',
    vehicleId: 'veh-ct-0009', // BMW Sedan in Century City
    startISO: '2025-12-20',
    endISO: '2025-12-23',
    pickUpLabel: 'Dec 20',
    dropOffLabel: 'Dec 23',
    status: 'upcoming',
    statusText: 'Starting in 1 week',
    days: 3,
    passengers: 4,
    contactName: 'Aisha (Owner)',
    contactAvatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    id: 'res-002',
    vehicleId: 'veh-ct-0015', // MINI Convertible in Camps Bay
    startISO: '2026-01-05',
    endISO: '2026-01-08',
    pickUpLabel: 'Jan 5',
    dropOffLabel: 'Jan 8',
    status: 'upcoming',
    statusText: 'Starting in 3 weeks',
    days: 3,
    passengers: 2,
    contactName: 'Johan (Owner)',
    contactAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
  {
    id: 'res-003',
    vehicleId: 'veh-ct-0017', // BMW Classic
    startISO: '2025-12-10',
    endISO: '2025-12-13',
    pickUpLabel: 'Dec 10',
    dropOffLabel: 'Dec 13',
    status: 'cancelled',
    statusText: 'Cancelled',
    days: 3,
    passengers: 2,
    contactName: 'Zara (Owner)',
    contactAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
];

// ---------- Screen ----------
const ReservationsScreen = () => {
  // Optional incoming params when user just clicked Reserve on a vehicle card
  // e.g. /screens/reservations?id=veh-ct-0001&start=2025-12-15&end=2025-12-18
  const { id, start, end } = useLocalSearchParams<{ id?: string; start?: string; end?: string }>();

  // Build “just-clicked” reservation (if params present & valid)
  const clickedReservation: VehicleReservation | undefined = useMemo(() => {
    if (!id || !start || !end) return undefined;
    const v = vehiclesById[id];
    if (!v) return undefined;
    return {
      id: `res-${Date.now()}`, // temp id
      vehicleId: id,
      startISO: start,
      endISO: end,
      pickUpLabel: fmtMMMd(start),
      dropOffLabel: fmtMMMd(end),
      status: 'upcoming',
      statusText: 'Draft booking',
      days: diffDays(start, end),
      passengers: v.seats,
      contactName: 'Verified Owner',
      contactAvatar: 'https://randomuser.me/api/portraits/men/78.jpg',
    };
  }, [id, start, end]);

  // Final list (clicked reservation—if any—appears first)
  const reservations: VehicleReservation[] = useMemo(
    () => (clickedReservation ? [clickedReservation, ...baseReservations] : baseReservations),
    [clickedReservation]
  );

  // Counts for chips
  const upcomingCount = reservations.filter((r) => r.status === 'upcoming').length;
  const cancelledCount = reservations.filter((r) => r.status === 'cancelled').length;

  return (
    <>
      <Header showBackButton title="Reservations" />

      <ThemedScroller className="flex-1 pt-8" keyboardShouldPersistTaps="handled">
        <Section title="Your vehicle reservations" titleSize="lg" className="mt-1" />
        <CardScroller className="mb-4 mt-2">
          <Chip size="lg" label="All" />
          <Chip size="lg" label={`Upcoming (${upcomingCount})`} />
          <Chip size="lg" label="Past" />
          <Chip size="lg" label={`Cancelled (${cancelledCount})`} />
        </CardScroller>

        {reservations.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </ThemedScroller>

      <ThemedFooter>
        <></>
      </ThemedFooter>
    </>
  );
};

interface ReservationCardProps {
  reservation: VehicleReservation;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation }) => {
  const vehicle = vehiclesById[reservation.vehicleId];

  const getStatusColor = (): string => {
    switch (reservation.status) {
      case 'upcoming':
        return 'text-black dark:text-white';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCardOpacity = () => (reservation.status === 'cancelled' ? 'opacity-60' : 'opacity-100');

  const openBookingDetail = () => {
    const qs =
      `?id=${encodeURIComponent(reservation.vehicleId)}` +
      `&start=${encodeURIComponent(reservation.startISO)}` +
      `&end=${encodeURIComponent(reservation.endISO)}` +
      `&days=${encodeURIComponent(String(reservation.days))}`;
    router.push(`/screens/trip-detail${qs}`);
  };

  // Chats are general (not vehicle-context), keep generic route if you like:
  const openChat = () => {
    router.push('/screens/chat/user');
  };

  return (
    <View
      style={shadowPresets.large}
      className={`mt-4 rounded-xl border border-neutral-300 bg-light-primary dark:border-neutral-700 dark:bg-dark-primary ${getCardOpacity()}`}>
      <View className="p-4">
        <ThemedText className={`mb-16 text-base font-semibold ${getStatusColor()}`}>
          {reservation.statusText}
        </ThemedText>

        <View className="flex-row items-center justify-between">
          <View className="pr-3">
            <ThemedText className="text-xl font-semibold">
              {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle'}
            </ThemedText>
            <ThemedText className="text-base">
              {reservation.pickUpLabel} - {reservation.dropOffLabel}
            </ThemedText>
            <ThemedText className="mt-1 text-sm text-gray-500">
              {reservation.days} {reservation.days === 1 ? 'day' : 'days'} •{' '}
              {reservation.passengers} seats
            </ThemedText>
            {vehicle && (
              <ThemedText className="mt-1 text-sm text-gray-500">
                {vehicle.locationArea}, Cape Town • R {vehicle.pricePerDay}/day
              </ThemedText>
            )}
          </View>

          {/* Vehicle image on the right */}
          <Image
            source={vehicle?.image ?? { uri: reservation.contactAvatar }}
            className="h-16 w-24 rounded-lg"
            resizeMode="cover"
          />
        </View>
      </View>

      {reservation.status !== 'cancelled' && (
        <View className="w-full flex-row border-t border-neutral-300 dark:border-neutral-700">
          <Pressable
            onPress={openBookingDetail}
            className="w-1/2 items-center border-r border-neutral-300 py-5 dark:border-neutral-700">
            <ThemedText className="font-semibold">View booking</ThemedText>
          </Pressable>
          <Pressable onPress={openChat} className="w-1/2 items-center py-5">
            <ThemedText className="font-semibold">Message</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ReservationsScreen;
