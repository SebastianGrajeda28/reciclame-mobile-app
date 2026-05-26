'use client';

import { Pressable, StyleSheet, View } from 'react-native';

type Props = Readonly<{
  onPress: () => void;
  disabled?: boolean;
}>;

export function CameraShutterButton({ onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.outer, pressed && styles.pressed]}
    >
      <View style={styles.inner} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  pressed: {
    opacity: 0.7,
  },
});
