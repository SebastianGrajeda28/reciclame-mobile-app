import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useItemColorMap(key: string) {
  const [map, setMapState] = useState<Record<string, string>>({});

  useEffect(() => {
    AsyncStorage.getItem(key).then((raw) => {
      if (raw) setMapState(JSON.parse(raw));
    });
  }, [key]);

  function setColor(style: string, color: string) {
    setMapState((prev) => {
      const next = { ...prev, [style]: color };
      AsyncStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }

  return { map, setColor };
}
