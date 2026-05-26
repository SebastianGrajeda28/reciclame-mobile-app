import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { CameraFlashMode } from '@/src/features/recycling/hooks/useCameraCapture';

type Props = Readonly<{
  flash: CameraFlashMode;
  onToggle: () => void;
}>;

function getFlashIcon(flash: CameraFlashMode) {
  if (flash === 'auto') {
    return <MaterialCommunityIcons name="flash-auto" size={22} color="white" />;
  }
  if (flash === 'on') {
    return <Ionicons name="flash" size={22} color="white" />;
  }
  return <Ionicons name="flash-off" size={22} color="white" />;
}

export function CameraFlashToggle({ flash, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {getFlashIcon(flash)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
