import { router } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import ActionSheet, { ActionSheetRef, FlatList } from 'react-native-actions-sheet';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomCard from '@/components/CustomCard';
import Header, { HeaderIcon } from '@/components/Header';
import ImageCarousel from '@/components/ImageCarousel';
import PriceMarker from '@/components/PriceMarker';
import SearchBar from '@/components/SearchBar';
import ShowRating from '@/components/ShowRating';
import ThemedText from '@/components/ThemedText';
import { allVehicles } from '@/data/vehicles';
import useThemeColors from '@/src/contexts/ThemeColors';

type IconName = Exclude<keyof typeof LucideIcons, 'createLucideIcon' | 'default'>;

// ✅ Build the list this screen expects using lat/lng from vehicles.ts
const vehicles = allVehicles.map((v) => ({
  id: v.id,
  title: v.title, // e.g., "Audi Sedan in City Bowl"
  price: `R ${v.pricePerDay}`, // pairs with "day" label below
  rating: (v.rating ?? 4.5).toFixed(1),
  description: `${v.make} ${v.model} • ${v.locationArea}`,
  lat: v.lat,
  lng: v.lng,
  image: v.image, // local require() source
}));

const MapScreen = () => {
  const colors = useThemeColors();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const mapRef = useRef<MapView>(null);
  useSafeAreaInsets();
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    actionSheetRef.current?.show();
  }, []);

  const rightComponents = [
    <>
      <HeaderIcon icon="SlidersHorizontal" href="/screens/filters" />
    </>,
  ];

  return (
    <>
      <Header showBackButton rightComponents={rightComponents} middleComponent={<SearchBar />} />

      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <MapView
          ref={mapRef}
          className="h-[100vh] w-full"
          initialRegion={{
            latitude: -33.9249, // Cape Town CBD
            longitude: 18.4241,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
        >
          {vehicles.map((vehicle) => (
            <PriceMarker
              key={vehicle.id}
              coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
              price={vehicle.price}
              title={vehicle.title}
              isSelected={selectedMarkerId === vehicle.id}
              onPress={() => {
                setSelectedMarkerId(vehicle.id);
                router.push(`/screens/product-detail?id=${encodeURIComponent(vehicle.id)}`);
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
              <ThemedText className="mt-3 font-bold">Vehicles in Cape Town</ThemedText>
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

                <View className="pb-global pt-2">
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
          />
        </ActionSheet>
      </View>
    </>
  );
};

export default MapScreen;
