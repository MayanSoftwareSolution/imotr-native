import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, View } from 'react-native';

import AniamatedView from '@/components/AnimatedView';
import { Chip } from '@/components/Chip';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import useThemeColors from '@/src/contexts/ThemeColors';

const EmptyScreen = () => {
  const colors = useThemeColors();

  return (
    <AniamatedView animation="scaleIn" className="flex-1">
      <Header
        title=" "
        //showBackButton
        rightComponents={[<HeaderIcon icon="PlusCircle" href="/screens/add-property-start" />]}
      />
      <ThemedScroller className="flex-1 pt-8" keyboardShouldPersistTaps="handled">
        <ThemedText className="text-3xl font-semibold">Your listings</ThemedText>
        <View className="mb-10 mt-2 flex-row gap-2">
          <Chip isSelected size="lg" label="All" />
          <Chip size="lg" label="Homes" />
          <Chip size="lg" label="Experiences" />
        </View>
        <ListingCard
          title="Apartment in New York"
          description="Brooklyn, NY"
          image={require('@/assets/img/room-2.avif')}
        />
        <ListingCard
          title="House in Barcelona"
          description="Barcelona, Spain"
          image={require('@/assets/img/room-1.avif')}
        />
        <ListingCard
          title="Lofthouse in New York"
          description="Brooklyn, NY"
          image={require('@/assets/img/room-3.avif')}
        />
        <ListingCard
          title="Apartment in New York"
          description="Brooklyn, NY"
          image={require('@/assets/img/room-4.avif')}
        />
        <ListingCard
          title="Beach house"
          description="Siargao, Philippines"
          image={require('@/assets/img/room-5.avif')}
        />
        <ListingCard
          title="Forest house"
          description="Rocky mountain, USA"
          image={require('@/assets/img/room-6.avif')}
        />
      </ThemedScroller>
    </AniamatedView>
  );
};

const ListingCard = (props: any) => {
  return (
    <Pressable
      onPress={() => router.push('/screens/product-detail')}
      className="mb-5 flex-row items-center gap-2">
      <Image className="mr-3 h-20 w-20 rounded-2xl" source={props.image} />
      <View>
        <ThemedText className="text-base font-semibold">{props.title}</ThemedText>
        <ThemedText className="mt-1 font-light">{props.description}</ThemedText>
      </View>
    </Pressable>
  );
};

export default EmptyScreen;
