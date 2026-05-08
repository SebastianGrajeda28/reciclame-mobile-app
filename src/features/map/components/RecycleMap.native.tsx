import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

type MarkerData = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
};

type Props = {
  markers: MarkerData[];
  region: Region;
  onMarkerPress: (id: string) => void;
};

export function RecycleMap({ markers, region, onMarkerPress }: Props) {
  return (
    <MapView provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={region}>
      {markers.map((item, index) => (
        <Marker
          key={item.id}
          identifier={item.id}
          title={`${index + 1}. ${item.title}`}
          coordinate={{ latitude: item.latitude, longitude: item.longitude }}
          onPress={() => onMarkerPress(item.id)}
        />
      ))}
    </MapView>
  );
}

