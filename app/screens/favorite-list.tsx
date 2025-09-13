import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import React, { useMemo, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import ActionSheet, { ActionSheetRef, FlatList } from 'react-native-actions-sheet';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CardScroller } from '@/components/CardScroller';
import { Chip } from '@/components/Chip';
import CustomCard from '@/components/CustomCard';
import Header, { HeaderIcon } from '@/components/Header';
import Icon from '@/components/Icon';
import ImageCarousel from '@/components/ImageCarousel';
import PriceMarker from '@/components/PriceMarker';
import SearchBar from '@/components/SearchBar';
import ShowRating from '@/components/ShowRating';
import SliderCard from '@/components/SliderCard';
import ThemedText from '@/components/ThemedText';
import Section from '@/components/layout/Section';

// 🚗 Shared vehicle data (includes lat/lng + locationArea)
import { allVehicles } from '@/data/vehicles';
import useThemeColors from '@/src/contexts/ThemeColors';

type IconName = Exclude<keyof typeof LucideIcons, 'createLucideIcon' | 'default'>;

const { height } = Dimensions.get('window');

const FavoriteListScreen = () => {
  const colors = useThemeColors();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string | number | null>(null);
  const [snapIndex, setSnapIndex] = React.useState(0);

  // 🔎 Read area from the query string (?area=Clifton)
  const { area } = useLocalSearchParams<{ area?: string }>();

  // 🎯 Filter vehicles by area (fallback to all if no area provided)
  const vehicles = useMemo(() => {
    const filtered = area ? allVehicles.filter((v) => v.locationArea === area) : allVehicles;
    return filtered.map((v) => ({
      id: v.id,
      title: v.title,
      price: `R ${v.pricePerDay}`,
      rating: v.rating ?? 4.5,
      description: `${v.make} ${v.model} • ${v.locationArea}`,
      lat: v.lat,
      lng: v.lng,
      image: v.image,
    }));
  }, [area]);

  // 🗺️ Center map on the first vehicle in the list (or CT CBD)
  const initialRegion = useMemo(
    () =>
      vehicles.length
        ? {
          latitude: vehicles[0].lat,
          longitude: vehicles[0].lng,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }
        : {
          latitude: -33.9249, // Cape Town CBD
          longitude: 18.4241,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        },
    [vehicles]
  );

  React.useEffect(() => {
    actionSheetRef.current?.show();
  }, []);

  const rightComponents = [
    <>
      <HeaderIcon
        onPress={() => {
          if (!actionSheetRef.current) return;
          const nextIndex = actionSheetRef.current.currentSnapIndex() === 0 ? 1 : 0;
          actionSheetRef.current.snapToIndex(nextIndex);
          setSnapIndex(nextIndex);
        }}
        icon="Map"
        href="0"
      />
    </>,
  ];

  return (
    <>
      <Header
        showBackButton
        rightComponents={rightComponents}
        middleComponent={<SearchBar />}
        title=""
      />

      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <MapView ref={mapRef} className="h-[100vh] w-full" initialRegion={initialRegion}>
          {vehicles.map((vehicle) => (
            <PriceMarker
              key={vehicle.id}
              coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
              price={vehicle.price}
              title={vehicle.title}
              isSelected={selectedMarkerId === vehicle.id}
              onPress={() => {
                setSelectedMarkerId(vehicle.id);
                router.push(`/screens/product-detail?id=${encodeURIComponent(String(vehicle.id))}`);
              }}
            />
          ))}
        </MapView>

        <ActionSheet
          ref={actionSheetRef}
          isModal={false}
          CustomHeaderComponent={
            <View className="mb-2 w-full items-center justify-center">
              <View className="mt-2 h-2 w-14 rounded-full bg-light-secondary dark:bg-dark-secondary" />
            </View>
          }
          backgroundInteractionEnabled
          initialSnapIndex={1}
          snapPoints={[10, 100]}
          gestureEnabled
          overdrawEnabled={false}
          closable={false}
          containerStyle={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: colors.bg,
          }}
        >
          <FlatList
            className="px-2"
            data={vehicles}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Section
                title={`Favourites${area ? ` — ${area}` : ''}`}
                titleSize="3xl"
                className="p-global"
              >
                <View className="flex-row gap-1 pt-3">
                  <Chip label={`${vehicles.length} vehicles`} size="lg" />
                  <Chip icon="Share2" label="Share" size="lg" />
                </View>
              </Section>
            }
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CustomCard
                padding="md"
                className="my-0 w-full overflow-hidden"
                href={`/screens/product-detail?id=${encodeURIComponent(String(item.id))}`}
              >
                <ImageCarousel
                  rounded="xl"
                  height={300}
                  className="w-full"
                  images={Array.isArray(item.image) ? item.image : [item.image]}
                />
                <View className="py-global">
                  <View className="flex-row items-center justify-between">
                    <ThemedText className="text-base font-bold">{item.title}</ThemedText>
                    <ShowRating rating={Number(item.rating)} size="md" />
                  </View>
                  <Text className="text-sm text-light-subtext dark:text-dark-subtext">
                    {item.description}
                  </Text>
                  <ThemedText className="mt-2 text-base font-bold">
                    {item.price} <Text className="font-normal">day</Text>
                  </ThemedText>
                </View>
              </CustomCard>
            )}
            ListEmptyComponent={
              <Section className="p-global pt-0" titleSize="lg" title="No favourites here (yet)">
                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                  Try another area or add vehicles to favourites.
                </ThemedText>
              </Section>
            }
          />
        </ActionSheet>
      </View>
    </>
  );
};

const PropertyType = (props: { title: string; icon: IconName; isActive?: boolean }) => {
  return (
    <TouchableOpacity
      className={`min-w-[50px] flex-shrink-0 items-center justify-normal px-4 py-4 ${
        props.isActive ? 'border-b-2 border-black opacity-100 dark:border-white' : 'opacity-70'
      }`}
    >
      <Icon name={props.icon} size={25} strokeWidth={1.5} />
      <ThemedText className="mt-2 text-xs">{props.title}</ThemedText>
    </TouchableOpacity>
  );
};

export default FavoriteListScreen;
