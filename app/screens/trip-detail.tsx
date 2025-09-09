import React from 'react';
import { View } from 'react-native';
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
import Section from '@/components/layout/Section';

// Sample trip data
const tripData = {
  id: '1',
  propertyName: 'Luxury Beachfront Villa',
  location: 'Barcelona, Spain',
  host: {
    name: 'Maria Rodriguez',
    avatar: require('@/assets/img/user-2.jpg'),
    rating: 4.9,
    reviewCount: 127,
  },
  checkIn: 'Jul 15, 2024',
  checkOut: 'Jul 22, 2024',
  nights: 7,
  guests: 4,
  reservationNumber: '#RES-789456',
  totalPrice: '$2,450',
  priceBreakdown: {
    nightlyRate: '$300',
    nights: 7,
    subtotal: '$2,100',
    cleaningFee: '$75',
    serviceFee: '$150',
    taxes: '$125',
    total: '$2,450',
  },
  paymentMethod: {
    type: 'Visa',
    lastFour: '1234',
    amount: '$2,450',
  },
  cancellationPolicy:
    'Free cancellation until Jul 8. Cancel before check-in on Jul 15 for a partial refund.',
  coordinates: {
    latitude: 41.3851,
    longitude: 2.1734,
  },
};

const TripDetailScreen = () => {
  return (
    <>
      <Header title="Trip Details" showBackButton />
      <ThemedScroller className="flex-1 px-0" keyboardShouldPersistTaps="handled">
        <AnimatedView animation="fadeIn" duration={400} delay={100}>
          {/* Property Images */}
          <View className="px-global">
            <ImageCarousel
              height={300}
              rounded="2xl"
              images={[
                'https://tinyurl.com/2blrf2sk',
                'https://tinyurl.com/2yyfr9rc',
                'https://tinyurl.com/2cmu4ns5',
              ]}
            />
          </View>

          {/* Property Name and Location */}
          <View className="px-global pb-4 pt-6">
            <ThemedText className="mb-2 text-2xl font-bold">{tripData.propertyName}</ThemedText>
            <View className="flex-row items-center">
              <Icon
                name="MapPin"
                size={16}
                className="mr-2 text-light-subtext dark:text-dark-subtext"
              />
              <ThemedText className="text-light-subtext dark:text-dark-subtext">
                {tripData.location}
              </ThemedText>
            </View>
          </View>

          <Divider className="h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Host Information */}
          <Section title="Hosted by" titleSize="lg" className="px-global pt-4">
            <View className="mb-4 mt-4 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <Avatar src={tripData.host.avatar} size="lg" />
                <View className="ml-3 flex-1">
                  <ThemedText className="text-lg font-semibold">{tripData.host.name}</ThemedText>
                  <View className="mt-1 flex-row items-center">
                    <ShowRating rating={tripData.host.rating} size="sm" />
                    <ThemedText className="ml-2 text-sm text-light-subtext dark:text-dark-subtext">
                      ({tripData.host.reviewCount} reviews)
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>

            <ListLink
              icon="MessageCircle"
              title="Message host"
              description="Get help with your reservation"
              href="/screens/chat/user"
              showChevron
              className="rounded-xl bg-light-secondary px-4 py-3 dark:bg-dark-secondary"
            />
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Check-in / Check-out */}
          <Section title="Your stay" titleSize="lg" className="px-global pt-4">
            <View className="mt-4 space-y-4">
              <View className="flex-row items-center justify-between rounded-xl bg-light-secondary p-4 dark:bg-dark-secondary">
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Check-in
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">{tripData.checkIn}</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    After 3:00 PM
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Check-out
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">{tripData.checkOut}</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Before 11:00 AM
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-2">
                <View>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Duration
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">
                    {tripData.nights} nights
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Guests
                  </ThemedText>
                  <ThemedText className="text-lg font-semibold">
                    {tripData.guests} guests
                  </ThemedText>
                </View>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Reservation Details */}
          <Section title="Reservation details" titleSize="lg" className="px-global pt-4">
            <View className="mt-4 space-y-3">
              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Reservation number
                </ThemedText>
                <ThemedText className="font-medium">{tripData.reservationNumber}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Guests
                </ThemedText>
                <ThemedText className="font-medium">{tripData.guests} guests</ThemedText>
              </View>

              <View className="mt-4">
                <ThemedText className="mb-2 text-sm font-medium">Cancellation policy</ThemedText>
                <ThemedText className="text-sm leading-5 text-light-subtext dark:text-dark-subtext">
                  {tripData.cancellationPolicy}
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
                  {tripData.priceBreakdown.nightlyRate} x {tripData.priceBreakdown.nights} nights
                </ThemedText>
                <ThemedText>{tripData.priceBreakdown.subtotal}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Cleaning fee
                </ThemedText>
                <ThemedText>{tripData.priceBreakdown.cleaningFee}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Service fee
                </ThemedText>
                <ThemedText>{tripData.priceBreakdown.serviceFee}</ThemedText>
              </View>

              <View className="flex-row justify-between">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">Taxes</ThemedText>
                <ThemedText>{tripData.priceBreakdown.taxes}</ThemedText>
              </View>

              <Divider className="my-3" />

              <View className="flex-row justify-between">
                <ThemedText className="text-lg font-bold">Total</ThemedText>
                <ThemedText className="text-lg font-bold">
                  {tripData.priceBreakdown.total}
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Payment Information */}
          <Section title="Payment information" titleSize="lg" className="px-global pt-4">
            <View className="mt-4 flex-row items-center">
              <Icon name="CreditCard" size={20} className="mr-3" />
              <View>
                <ThemedText className="font-medium">
                  {tripData.paymentMethod.type} •••• {tripData.paymentMethod.lastFour}
                </ThemedText>
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                  Charged {tripData.paymentMethod.amount}
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Rules and Instructions */}
          <Section title="House rules & instructions" titleSize="lg" className="px-global pt-4">
            <View className="mt-4 space-y-4">
              <View className="flex-row items-start">
                <Icon
                  name="Clock"
                  size={16}
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                />
                <View>
                  <ThemedText className="font-medium">Check-in: After 3:00 PM</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Self check-in with keypad
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-start">
                <Icon
                  name="Users"
                  size={16}
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                />
                <View>
                  <ThemedText className="font-medium">Maximum 4 guests</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    No additional guests allowed
                  </ThemedText>
                </View>
              </View>

              <View className="flex-row items-start">
                <Icon
                  name="Volume2"
                  size={16}
                  className="mr-3 mt-1 text-light-subtext dark:text-dark-subtext"
                />
                <View>
                  <ThemedText className="font-medium">Quiet hours: 10:00 PM - 8:00 AM</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                    Please respect the neighbors
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
                    Smoking is not allowed anywhere on the property
                  </ThemedText>
                </View>
              </View>
            </View>
          </Section>

          <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

          {/* Location */}
          <Section title="Location" titleSize="lg" className="px-global pb-6 pt-4">
            <View className="mt-4">
              <ThemedText className="mb-4 text-light-subtext dark:text-dark-subtext">
                {tripData.location}
              </ThemedText>

              {/* Placeholder for map - you can integrate with react-native-maps */}
              <View className="h-48 w-full items-center justify-center rounded-xl bg-light-secondary dark:bg-dark-secondary">
                <Icon
                  name="Map"
                  size={48}
                  className="mb-2 text-light-subtext dark:text-dark-subtext"
                />
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Interactive map coming soon
                </ThemedText>
              </View>

              <Button
                title="Open in Maps"
                iconStart="ExternalLink"
                variant="outline"
                className="mt-4"
                onPress={() => {
                  // Open in device maps app
                  console.log('Open in maps');
                }}
              />
            </View>
          </Section>
        </AnimatedView>
      </ThemedScroller>

      <ThemedFooter>
        <View className="flex-row space-x-3">
          <Button
            title="Review"
            variant="outline"
            iconStart="Star"
            className="flex-1"
            href="/screens/review"
          />
          <Button
            title="Cancel trip"
            variant="outline"
            iconStart="X"
            className="flex-1"
            onPress={() => console.log('Cancel trip')}
          />
        </View>
      </ThemedFooter>
    </>
  );
};

export default TripDetailScreen;
