import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AvatarConfig, getLayers } from '@/src/features/profile/data/avatarCatalog';

type AvatarComposerProps = {
  config: AvatarConfig;
  size?: number;
  blink?: boolean;
};

const NATIVE_SIZE = 32;
const BLINK_INTERVAL_MS = 4000;
const BLINK_DURATION_MS = 120;

export function AvatarComposer({ config, size = 160, blink = true }: AvatarComposerProps) {
  const [eyeFrame, setEyeFrame] = useState<1 | 2>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!blink) return;

    function scheduleBlink() {
      timerRef.current = setTimeout(() => {
        setEyeFrame(2);
        timerRef.current = setTimeout(() => {
          setEyeFrame(1);
          scheduleBlink();
        }, BLINK_DURATION_MS);
      }, BLINK_INTERVAL_MS + Math.random() * 2000);
    }

    scheduleBlink();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [blink]);

  const layers = getLayers(config, eyeFrame);
  const scale = Math.max(1, Math.floor(size / NATIVE_SIZE));
  const renderSize = NATIVE_SIZE * scale;
  const offset = (size - renderSize) / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.inner, { width: renderSize, height: renderSize, top: offset, left: offset }]}>
        {layers.map((layer) => (
          <Image
            key={layer.key}
            source={layer.source}
            // @ts-expect-error imageRendering is web-only
            style={[StyleSheet.absoluteFill, styles.layer, { imageRendering: 'pixelated' }]}
            resizeMode="stretch"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  inner: {
    position: 'absolute',
  },
  layer: {
    width: '100%',
    height: '100%',
  },
});
