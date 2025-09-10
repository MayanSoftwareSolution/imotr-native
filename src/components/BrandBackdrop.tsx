// src/components/BrandBackdrop.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Dimensions, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_GREEN_RGBA_PREFIX = 'rgba(105,223,167,'; // append alpha + ')'

type Props = {
  /** Portion of the screen height covered by the fade (0–1). Default 0.3 = 30% */
  cover?: number;
  /** Strength of the tint at the very top (0–1). Default 0.22 */
  strength?: number;
};

export default function BrandBackdrop({ cover = 0.3, strength = 0.22 }: Props) {
  const insets = useSafeAreaInsets();
  const { height: H } = Dimensions.get('window');

  const clampedCover = Math.max(0, Math.min(1, cover));
  const clampedStrength = Math.max(0, Math.min(1, strength));

  // Height includes status bar so the fade starts under it
  const gradientHeight = useMemo(
    () => Math.round(insets.top + H * clampedCover),
    [H, insets.top, clampedCover]
  );

  // Readonly tuple so expo-linear-gradient is happy (TS-safe)
  const colors = useMemo(
    () =>
      [
        `${BRAND_GREEN_RGBA_PREFIX}${clampedStrength})`,
        `${BRAND_GREEN_RGBA_PREFIX}${clampedStrength * 0.6})`,
        `${BRAND_GREEN_RGBA_PREFIX}0)`,
      ] as const satisfies readonly [ColorValue, ColorValue, ...ColorValue[]],
    [clampedStrength]
  );

  const locations = useMemo(() => [0, 0.4, 1] as const, []);

  return (
    <LinearGradient
      pointerEvents="none" // never block touches
      colors={colors}
      locations={locations}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: gradientHeight,
        zIndex: 0,
      }}
    />
  );
}
