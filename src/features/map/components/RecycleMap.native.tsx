import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { MapMarker } from '@/src/features/map/components/MapMarker';
import { theme } from '@/src/ui/theme';

type MarkerData = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
};

type Props = {
  markers: MarkerData[];
  region: Region;
  centerCoordinate: { latitude: number; longitude: number };
  selectedMarkerId?: string;
  onMarkerPress: (id: string) => void;
};

export function RecycleMap({ markers, region, centerCoordinate, selectedMarkerId, onMarkerPress }: Props) {
  return (
    <MapView provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={region}>
      <Circle
        center={centerCoordinate}
        radius={3000}
        strokeColor={theme.palette.green[400]}
        strokeWidth={1.5}
        fillColor="rgba(67,223,139,0.08)"
      />
      {markers.map((item, index) => (
        <Marker
          key={item.id}
          identifier={item.id}
          coordinate={{ latitude: item.latitude, longitude: item.longitude }}
          onPress={() => onMarkerPress(item.id)}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <MapMarker number={index + 1} selected={item.id === selectedMarkerId} />
        </Marker>
      ))}
    </MapView>
  );
}
