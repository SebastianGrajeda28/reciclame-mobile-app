import { Platform } from 'react-native';

import { RecycleMap as NativeRecycleMap } from '@/src/features/map/components/RecycleMap.native';
import { RecycleMap as WebRecycleMap } from '@/src/features/map/components/RecycleMap.web';

type MarkerData = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
};

type Props = {
  markers: MarkerData[];
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress: (id: string) => void;
};

export function RecycleMap(props: Props) {
  if (Platform.OS === 'web') {
    return <WebRecycleMap markers={props.markers} onMarkerPress={props.onMarkerPress} />;
  }
  return <NativeRecycleMap {...props} />;
}
