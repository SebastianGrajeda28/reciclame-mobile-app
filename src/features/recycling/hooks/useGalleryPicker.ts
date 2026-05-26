import { Alert, Linking, Platform } from 'react-native';
import { launchImageLibraryAsync, useMediaLibraryPermissions } from 'expo-image-picker';

export function useGalleryPicker() {
  const [permission, requestPermission] = useMediaLibraryPermissions();

  async function pickImage(): Promise<string | null> {
    let perm = permission;

    if (!perm?.granted) {
      if (perm?.status === 'denied') {
        if (Platform.OS === 'ios') Linking.openSettings();
        return null;
      }
      perm = await requestPermission();
      if (!perm.granted) return null;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    }).catch(() => {
      Alert.alert(
        'No se pudo abrir la galería',
        'Hubo un problema al intentar acceder a tus fotos. Intenta de nuevo o usa la cámara.',
        [{ text: 'Entendido' }],
      );
      return null;
    });

    if (!result) return null;

    if (result.canceled || !result.assets?.[0]?.uri) return null;
    return result.assets[0].uri;
  }

  return { permission, pickImage };
}
