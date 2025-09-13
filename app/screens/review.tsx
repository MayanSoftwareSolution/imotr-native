import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';

import { Button } from '@/components/Button';
import Header from '@/components/Header';
import ThemedFooter from '@/components/ThemeFooter';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';
import { vehiclesById } from '@/data/vehicles';
import useThemeColors from '@/src/contexts/ThemeColors';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

const StarRating = ({ rating, setRating }: StarRatingProps) => {
  const colors = useThemeColors();

  const handlePress = (starIndex: number) => {
    const newRating = starIndex + 1;
    setRating(newRating === rating ? 0 : newRating);
  };

  return (
    <View className="my-6 flex-row justify-center">
      {[0, 1, 2, 3, 4].map((starIndex) => (
        <TouchableOpacity
          key={starIndex}
          onPress={() => handlePress(starIndex)}
          className="h-10 w-10 items-center justify-center">
          <FontAwesome
            name={rating > starIndex ? 'star' : 'star-o'}
            size={30}
            color={rating > starIndex ? colors.icon : colors.text}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Helpers
const fmtDate = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtRange = (start?: string, end?: string) => {
  const s = fmtDate(start);
  const e = fmtDate(end);
  if (!s || !e) return undefined;
  return `${s} – ${e}`;
};

const ReviewScreen = () => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Expect: /screens/review?id=veh-ct-0009&start=2025-08-15&end=2025-08-22
  const { id, start, end } = useLocalSearchParams<{ id?: string; start?: string; end?: string }>();

  const vehicle = id ? vehiclesById[id] : undefined;

  const headerTitle = 'Review Vehicle';
  const dateLabel = useMemo(() => fmtRange(start, end), [start, end]);

  const fallbackImage = require('@/assets/img/room-1.avif');
  const displayImage = vehicle?.image ?? fallbackImage;
  const displayName = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle';

  const handleSubmit = () => {
    // Implement your submission (API, local store, etc.)
    console.log({
      vehicleId: id,
      rating,
      review,
      start,
      end,
    });
    router.back();
  };

  return (
    <>
      <Header title={headerTitle} showBackButton />
      <ThemedScroller className="flex-1 pt-8" keyboardShouldPersistTaps="handled">
        {/* Vehicle Summary */}
        <View className="mb-0 flex-col items-center">
          <Image
            source={displayImage}
            className="h-32 w-32 rounded-lg bg-light-secondary dark:bg-dark-secondary"
          />
          <View className="flex-1 items-center justify-center">
            <ThemedText className="mt-global text-base font-bold">
              {vehicle?.title ?? displayName}
            </ThemedText>
            {dateLabel ? (
              <ThemedText className="text-light-subtext dark:text-dark-subtext">
                {dateLabel}
              </ThemedText>
            ) : null}
          </View>
        </View>

        {/* Star Rating */}
        <StarRating rating={rating} setRating={setRating} />

        {/* Review Input */}
        <Input
          label="Share your experience with this vehicle"
          isMultiline
          style={{ textAlignVertical: 'top', height: 120 }}
          value={review}
          onChangeText={setReview}
          placeholder="How was the ride, comfort, pick-up/drop-off, etc.?"
        />
      </ThemedScroller>

      <ThemedFooter>
        <Button
          title="Submit Review"
          onPress={handleSubmit}
          disabled={rating === 0 || !review.trim()}
        />
      </ThemedFooter>
    </>
  );
};

export default ReviewScreen;
