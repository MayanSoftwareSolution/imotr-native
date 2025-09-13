import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Pressable, View, Platform } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedView from './AnimatedView';
import { Button } from './Button';
import DateRangeCalendar from './DateRangeCalendar';
import Icon from './Icon';
import ThemedScroller from './ThemeScroller';
import ThemedText from './ThemedText';
import Counter from './forms/Counter';
import Divider from './layout/Divider';

import { allVehicles } from '@/data/vehicles';
import useThemeColors from '@/src/contexts/ThemeColors';
// eslint-disable-next-line import/order
import { shadowPresets } from '@/utils/useShadow';

// NEW: use your central vehicles data

const SearchBar = (props: any) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <View className="relative z-50 w-full bg-light-primary px-global dark:bg-dark-primary">
        <Pressable onPress={() => setShowModal(true)}>
          <Animated.View
            sharedTransitionTag="searchBar"
            style={{
              elevation: 10,
              height: 50,
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 8.84,
              shadowOffset: { width: 0, height: 0 },
            }}
            className="relative z-50 mb-4 mt-3 flex-row items-center justify-center rounded-full bg-light-primary px-10 py-4 dark:bg-white/20">
            <Icon name="Search" size={16} strokeWidth={3} />
            <ThemedText className="ml-2 mr-4 font-medium text-black dark:text-white">
              Find vehicles in Cape Town
            </ThemedText>
          </Animated.View>
        </Pressable>
      </View>

      <SearchModal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
};

const SearchModal = ({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [openAccordion, setOpenAccordion] = useState<string | null>('where');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // Areas + counts from vehicles.ts
  const areas = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of allVehicles) {
      map.set(v.locationArea, (map.get(v.locationArea) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const areaLabel = selectedArea ?? areas[0]?.area ?? 'Cape Town';

  return (
    <Modal
      statusBarTranslucent
      className="flex-1"
      visible={showModal}
      transparent
      animationType="fade">
      <BlurView
        experimentalBlurMethod="none"
        intensity={20}
        tint="systemUltraThinMaterialLight"
        className="flex-1">
        <AnimatedView
          className="flex-1"
          animation="slideInTop"
          duration={Platform.OS === 'ios' ? 500 : 0}
          delay={0}>
          <View className="flex-1 bg-neutral-200/70 dark:bg-black/90 ">
            <ThemedScroller style={{ paddingTop: insets.top + 10 }} className="bg-transparent">
              <Pressable
                onPress={() => setShowModal(false)}
                style={{
                  ...shadowPresets.card,
                  elevation: 10,
                  height: 50,
                  shadowColor: '#000',
                  shadowOpacity: 0.3,
                  shadowRadius: 8.84,
                  shadowOffset: { width: 0, height: 0 },
                }}
                className="my-3 ml-auto h-12 w-12 items-center justify-center rounded-full bg-light-primary dark:bg-dark-secondary">
                <Icon name="X" size={24} strokeWidth={2} />
              </Pressable>

              <AccordionItem
                title="Pick-up location"
                label={areaLabel}
                isOpen={openAccordion === 'where'}
                onPress={() => setOpenAccordion(openAccordion === 'where' ? null : 'where')}>
                <Where
                  areas={areas}
                  selectedArea={selectedArea}
                  onSelectArea={(area: string) => {
                    setSelectedArea(area);
                    setOpenAccordion('when');
                  }}
                />
              </AccordionItem>

              <AccordionItem
                title="Dates"
                label="Select dates"
                isOpen={openAccordion === 'when'}
                onPress={() => setOpenAccordion(openAccordion === 'when' ? null : 'when')}>
                <DateRangeCalendar
                  onDateRangeChange={(range) => {
                    // keep behavior, wire to state if needed
                    console.log('Date range selected:', range);
                  }}
                  minDate={new Date().toISOString().split('T')[0]}
                  className="mt-4"
                />
              </AccordionItem>

              <AccordionItem
                title="Passengers"
                label="1 driver"
                isOpen={openAccordion === 'who'}
                onPress={() => setOpenAccordion(openAccordion === 'who' ? null : 'who')}>
                <CounterRow label="Drivers" legend="Must be 18+ with licence" />
                <Divider />
                <CounterRow label="Passengers" legend="Non-drivers" />
                <Divider />
                <CounterRow label="Child seats" legend="Optional add-on" />
                <Divider />
                <CounterRow label="Pets" legend="Travelling with a pet?" />
              </AccordionItem>
            </ThemedScroller>

            <View
              style={{ paddingBottom: insets.bottom + 10 }}
              className="w-full flex-row justify-between px-6">
              <Button title="Clear" onPress={() => setShowModal(false)} variant="ghost" />
              <Button
                iconStart="Search"
                title="Search"
                iconColor="white"
                textClassName="text-white"
                onPress={() => {
                  setShowModal(false);
                  // pass area if selected (safe even if map ignores it)
                  const qs = selectedArea ? `?area=${encodeURIComponent(selectedArea)}` : '';
                  router.push(`/screens/map${qs}`);
                }}
                variant="primary"
              />
            </View>
          </View>
        </AnimatedView>
      </BlurView>
    </Modal>
  );
};

const AccordionItem = ({
  title,
  children,
  isOpen,
  label,
  onPress,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  label?: string;
  onPress: () => void;
}) => {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(animatedHeight.value, { duration: 200 }),
    overflow: 'hidden',
  }));

  useEffect(() => {
    animatedHeight.value = isOpen ? contentHeight : 0;
  }, [isOpen, contentHeight]);

  return (
    <View
      style={{ ...shadowPresets.large }}
      className="relative mb-global rounded-2xl bg-light-primary dark:bg-dark-secondary">
      <Pressable onPress={onPress} className="w-full p-global">
        <View className="w-full flex-row items-center justify-between">
          <ThemedText className="text-lg font-semibold">{title}</ThemedText>
          {!isOpen ? <ThemedText className="text-sm font-semibold">{label}</ThemedText> : null}
        </View>
      </Pressable>

      <Animated.View style={animatedStyle}>
        <View
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
          className="absolute -mt-4 w-full px-global pb-2 pt-0">
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const CounterRow = (props: { label: string; legend: string }) => {
  return (
    <View className="flex-row items-center justify-between py-4">
      <View>
        <ThemedText className="text-base font-semibold">{props.label}</ThemedText>
        <ThemedText className="text-sm">{props.legend}</ThemedText>
      </View>
      <Counter />
    </View>
  );
};

const Where = ({
  areas,
  selectedArea,
  onSelectArea,
}: {
  areas: { area: string; count: number }[];
  selectedArea: string | null;
  onSelectArea: (area: string) => void;
}) => {
  const colors = useThemeColors();

  return (
    <>
      <View className="relative">
        <Icon
          name="Search"
          className="absolute left-4 top-1/2 -translate-y-1/2"
          size={16}
          strokeWidth={3}
        />
        <TextInput
          className="mt-4 rounded-xl border border-neutral-500 p-4 pl-10 dark:border-neutral-300"
          placeholder="Search areas or vehicles"
          placeholderTextColor={colors.text}
        />
      </View>

      {selectedArea ? (
        <>
          <ThemedText className="mt-4 text-xs">Selected</ThemedText>
          <DestinationRow
            icon="MapPin"
            title={selectedArea}
            description="Tap to change"
            onPress={() => onSelectArea(selectedArea)}
          />
        </>
      ) : null}

      <ThemedText className="mt-4 text-xs">Popular areas</ThemedText>
      {areas.slice(0, 8).map(({ area, count }) => (
        <DestinationRow
          key={area}
          icon="MapPin"
          title={area}
          description={`${count} vehicles`}
          onPress={() => onSelectArea(area)}
        />
      ))}
    </>
  );
};

const DestinationRow = (props: {
  icon: string;
  title: string;
  description: string;
  iconbg?: string;
  onPress?: () => void;
}) => {
  return (
    <Pressable onPress={props.onPress} className="my-2 flex-row items-center justify-start">
      <Icon
        name={props.icon as any}
        size={25}
        strokeWidth={1.2}
        className={`h-12 w-12 rounded-xl bg-light-secondary dark:bg-dark-primary ${props.iconbg ?? ''}`}
      />
      <View className="ml-4">
        <ThemedText className="text-sm font-semibold">{props.title}</ThemedText>
        <ThemedText className="text-xs text-neutral-500">{props.description}</ThemedText>
      </View>
    </Pressable>
  );
};

export default SearchBar;
