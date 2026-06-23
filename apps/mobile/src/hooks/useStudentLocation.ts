import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

const PUCP_CENTER = { latitude: -12.0695, longitude: -77.0793 };

type Coordinate = { latitude: number; longitude: number };

export function useStudentLocation(): Coordinate {
  const [location, setLocation] = useState<Coordinate>(PUCP_CENTER);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let mounted = true;

    async function startWatching() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (status !== 'granted') return;

      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
        (pos) => {
          if (mounted) {
            setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          }
        },
      );
    }

    startWatching();

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  return location;
}
