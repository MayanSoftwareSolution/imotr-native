import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import Header from '@/components/Header';
import ThemeFooter from '@/components/ThemeFooter';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import Counter from '@/components/forms/Counter';
import Slider from '@/components/forms/Slider';
import Switch from '@/components/forms/Switch';
import Section from '@/components/layout/Section';
import { allVehicles } from '@/data/vehicles';

export default function FiltersScreen() {
  const router = useRouter();
  const [price, setPrice] = useState(50);

  const vehicleTypes = useMemo(() => {
    const set = new Set(allVehicles.map((v) => v.type));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const handleApplyFilters = () => {
    router.back();
  };

  return (
    <>
      <Header showBackButton title="Filters" />
      <ThemedScroller className="flex-1 bg-light-primary dark:bg-dark-primary">
        {/* Vehicle type: multi-select chips with reliable spacing */}
        <Section
          className="mb-7 mt-8 border-b border-light-secondary pb-7 dark:border-dark-secondary"
          title="Vehicle type"
        >
          <View style={{ paddingTop: 20 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {vehicleTypes.map((t) => (
                <View key={t} style={{ marginRight: 8, marginBottom: 8 }}>
                  <Chip icon="Car" label={t} size="lg" selectable />
                </View>
              ))}
            </View>
          </View>
        </Section>

        <Section
          className="mb-7 border-b border-light-secondary pb-7 dark:border-dark-secondary"
          title="Price per day"
          subtitle={`Up to R${price} / day`}
        >
          <Slider
            value={price}
            onValueChange={setPrice}
            minValue={100}
            maxValue={1000}
            step={5}
            initialValue={500}
            size="l"
            className="mt-2"
          />
        </Section>

        <Section
          className="mb-7 border-b border-light-secondary pb-7 dark:border-dark-secondary"
          title="Seats & doors"
        >
          <CounterRow label="Seats" />
          <CounterRow label="Doors" />
          <CounterRow label="Child seats" />
        </Section>

        {/* Features: multi-select chips with reliable spacing */}
        <Section
          className="mb-7 border-b border-light-secondary pb-7 dark:border-dark-secondary"
          title="Features"
        >
          <View style={{ paddingTop: 20 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <View style={{ marginRight: 8, marginBottom: 8 }}>
                <Chip icon="Snowflake" label="Air conditioning" size="lg" selectable />
              </View>
              <View style={{ marginRight: 8, marginBottom: 8 }}>
                <Chip icon="Wifi" label="Bluetooth" size="lg" selectable />
              </View>
              <View style={{ marginRight: 8, marginBottom: 8 }}>
                <Chip icon="Tv" label="CarPlay / Android Auto" size="lg" selectable />
              </View>
              <View style={{ marginRight: 8, marginBottom: 8 }}>
                <Chip icon="Car" label="Roof rack" size="lg" selectable />
              </View>
              <View style={{ marginRight: 8, marginBottom: 8 }}>
                <Chip icon="Car" label="Parking sensors" size="lg" selectable />
              </View>
            </View>
          </View>
        </Section>

        <Section
          className="mb-7 border-b border-light-secondary pb-7 dark:border-dark-secondary"
          title="Additional options"
        >
          <View className="mt-4 space-y-4">
            <Switch label="Automatic transmission" />
            <Switch label="Unlimited kilometres" />
            <Switch label="Delivery available" />
          </View>
        </Section>
      </ThemedScroller>
      <ThemeFooter>
        <Button
          title="Apply Filters"
          rounded="full"
          size="large"
          className="bg-highlight"
          textClassName="text-white"
          onPress={handleApplyFilters}
        />
      </ThemeFooter>
    </>
  );
}

const CounterRow = (props: { label: string }) => {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View>
        <ThemedText className="text-base font-normal">{props.label}</ThemedText>
      </View>
      <Counter />
    </View>
  );
};
