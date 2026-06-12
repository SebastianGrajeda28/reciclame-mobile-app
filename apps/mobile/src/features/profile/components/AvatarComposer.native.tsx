import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, FilterMode, Image as SkiaImage, MipmapMode, useImage } from '@shopify/react-native-skia';

import { AvatarConfig, getLayers } from '@/src/features/profile/data/avatarCatalog';

export type AvatarComposerProps = {
  config: AvatarConfig;
  size?: number;
  blink?: boolean;
  showBg?: boolean;
};

const NATIVE_SIZE = 32;
const BLINK_INTERVAL_MS = 4000;
const BLINK_DURATION_MS = 120;
const NEAREST_SAMPLING = {
  filter: FilterMode.Nearest,
  mipmap: MipmapMode.None,
} as const;

function getPixelPerfectScale(size: number) {
  return Math.max(1, Math.floor(size / NATIVE_SIZE));
}

function AvatarLayer({ source, size }: { source: number; size: number }) {
  const image = useImage(source);

  if (!image) return null;

  return (
    <SkiaImage
      image={image}
      x={0}
      y={0}
      width={size}
      height={size}
      fit="fill"
      sampling={NEAREST_SAMPLING}
    />
  );
}

export function AvatarComposer({ config, size = 160, blink = true, showBg = true }: AvatarComposerProps) {
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

  const layers = getLayers(config, eyeFrame, showBg);
  const scale = getPixelPerfectScale(size);
  const renderSize = NATIVE_SIZE * scale;
  const offset = (size - renderSize) / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.inner, { width: renderSize, height: renderSize, top: offset, left: offset }]}>
        <Canvas
          style={[StyleSheet.absoluteFill, { width: renderSize, height: renderSize }]}
        >
          {layers.map((layer) => (
            <AvatarLayer
              key={layer.key}
              source={layer.source}
              size={renderSize}
            />
          ))}
        </Canvas>
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
});
