import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, FilterMode, Image as SkiaImage, MipmapMode, SkImage, useImage } from '@shopify/react-native-skia';

import { AvatarConfig, getLayers } from './avatarCatalog';

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

// Max layers getLayers can return: bg+base+ears+clothes+nose+mouth+eyes+brows+beard+moustache+hair+hat = 12
const MAX_LAYERS = 12;

function getPixelPerfectScale(size: number) {
  return Math.max(1, Math.floor(size / NATIVE_SIZE));
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

  console.log('[AvatarComposer] layers:', layers.length, layers.map(l => `${l.key}(${l.source})`).join(','));

  // useImage must be called outside Canvas (normal React reconciler, not Skia's).
  // Calling it inside a Canvas child component prevents its body from running.
  const i0  = useImage(layers[0]?.source  ?? null);
  const i1  = useImage(layers[1]?.source  ?? null);
  const i2  = useImage(layers[2]?.source  ?? null);
  const i3  = useImage(layers[3]?.source  ?? null);
  const i4  = useImage(layers[4]?.source  ?? null);
  const i5  = useImage(layers[5]?.source  ?? null);
  const i6  = useImage(layers[6]?.source  ?? null);
  const i7  = useImage(layers[7]?.source  ?? null);
  const i8  = useImage(layers[8]?.source  ?? null);
  const i9  = useImage(layers[9]?.source  ?? null);
  const i10 = useImage(layers[10]?.source ?? null);
  const i11 = useImage(layers[11]?.source ?? null);

  const images: (SkImage | null)[] = [i0, i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11];
  console.log('[AvatarComposer] images loaded:', images.filter(Boolean).length, '/', layers.length);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.inner, { width: renderSize, height: renderSize, top: offset, left: offset }]}>
        <Canvas
          style={[StyleSheet.absoluteFill, { width: renderSize, height: renderSize }]}
        >
          {layers.map((layer, idx) => {
            const image = images[idx];
            if (!image) return null;
            return (
              <SkiaImage
                key={layer.key}
                image={image}
                x={0}
                y={0}
                width={renderSize}
                height={renderSize}
                fit="fill"
                sampling={NEAREST_SAMPLING}
              />
            );
          })}
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
