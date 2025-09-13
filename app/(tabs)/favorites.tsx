import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';

import AnimatedView from '@/components/AnimatedView';
import Card from '@/components/Card';
import Header, { HeaderIcon } from '@/components/Header';
import Icon from '@/components/Icon';
import { Placeholder } from '@/components/Placeholder';
import ThemeScroller from '@/components/ThemeScroller';
// eslint-disable-next-line import/order
import Grid from '@/components/layout/Grid';

// 🔗 Pull vehicles (with lat/lng + locationArea) from the shared data source
import { allVehicles } from '@/data/vehicles';
import { useCollapsibleTitle } from '@/src/hooks/useCollapsibleTitle';

const FavoritesScreen = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { scrollY, scrollHandler, scrollEventThrottle } = useCollapsibleTitle();

  // Group favorites by location. For the POC we treat all vehicles as "saved".
  const savedByArea = useMemo(() => {
    const map = new Map<string, { area: string; count: number; image: any }>();

    for (const v of allVehicles) {
      const key = v.locationArea;
      if (!map.has(key)) {
        map.set(key, { area: key, count: 1, image: v.image });
      } else {
        map.get(key)!.count += 1;
      }
    }

    // Turn into an array, sort by count desc
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        id: item.area, // use area as id
        title: item.area, // card title
        descrition: `${item.count} saved`, // keep prop name used below
        image: item.image, // cover image
      }));
  }, []);

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <AnimatedView animation="scaleIn" className="flex-1">
        <Header
          rightComponents={[
            <HeaderIcon
              key="edit"
              icon={isEditMode ? 'Check' : 'Edit2'}
              onPress={() => setIsEditMode(!isEditMode)}
              href="0"
            />,
          ]}
          title="Favorites"
          variant="collapsibleTitle"
          scrollY={scrollY}
        />

        <ThemeScroller
          onScroll={scrollHandler}
          scrollEventThrottle={scrollEventThrottle}
          className="pt-4">
          {savedByArea.length > 0 ? (
            <Grid className="mt-2" columns={2} spacing={20}>
              {savedByArea.map((item) => (
                <Card
                  key={item.id}
                  title={item.title}
                  image={item.image}
                  description={item.descrition}
                  imageHeight={180}
                  rounded="2xl"
                  // Pass area to the child list so it can filter
                  href={`/screens/favorite-list?area=${encodeURIComponent(item.title)}`}>
                  {isEditMode && (
                    <Pressable className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-light-primary dark:bg-dark-primary">
                      <Icon name="X" size={18} strokeWidth={2} />
                    </Pressable>
                  )}
                </Card>
              ))}
            </Grid>
          ) : (
            <Placeholder
              title="No saved items"
              subtitle="Browse vehicles and tap the heart to save your favorites"
            />
          )}
        </ThemeScroller>
      </AnimatedView>
    </View>
  );
};

export default FavoritesScreen;
