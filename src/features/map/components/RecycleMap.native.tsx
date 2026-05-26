import { useRef } from 'react';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

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
  onMapReady?: (recenter: () => void) => void;
};

export function RecycleMap({ markers, region, centerCoordinate, selectedMarkerId, onMarkerPress, onMapReady }: Props) {
  const mapRef = useRef<MapView>(null);

  function recenter() {
    mapRef.current?.animateToRegion(
      { ...centerCoordinate, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta },
      400,
    );
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={region}
      onMapReady={() => onMapReady?.(recenter)}
    >
      <Circle
        center={centerCoordinate}
        radius={3000}
        strokeColor={theme.palette.green[400]}
        strokeWidth={1.5}
        fillColor="rgba(67,223,139,0.08)"
      />
      {markers.map((item) => {
        const selected = item.id === selectedMarkerId;
        return (
          <Marker
            key={`${item.id}-${selected ? 's' : 'u'}`}
            identifier={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            onPress={() => onMarkerPress(item.id)}
            pinColor={selected ? theme.palette.navy[500] : theme.palette.green[600]}
          />
        );
      })}
    </MapView>
  );
}
