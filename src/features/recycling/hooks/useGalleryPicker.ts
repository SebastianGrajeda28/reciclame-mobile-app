import { Alert, Linking, Platform } from 'react-native';
import { launchImageLibraryAsync, useMediaLibraryPermissions } from 'expo-image-picker';

import { validateImage } from '@/src/features/recycling/services/image-validation';

export type GalleryPickResult =
  | { status: 'ok'; uri: string }
  | { status: 'invalid'; error: string }
  | { status: 'cancelled' };

export function useGalleryPicker() {
  const [permission, requestPermission] = useMediaLibraryPermissions();

  async function pickImage(): Promise<GalleryPickResult> {
    let perm = permission;

    if (!perm?.granted) {
      if (perm?.status === 'denied') {
        if (Platform.OS === 'ios') Linking.openSettings();
        return { status: 'cancelled' };
      }
      perm = await requestPermission();
      if (!perm.granted) return { status: 'cancelled' };
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

    if (!result) return { status: 'cancelled' };
    if (result.canceled || !result.assets?.[0]?.uri) return { status: 'cancelled' };

    const asset = result.assets[0];
    const validation = validateImage({
      uri: asset.uri,
      fileName: asset.fileName ?? undefined,
      mimeType: asset.mimeType ?? undefined,
      fileSize: asset.fileSize ?? undefined,
      width: asset.width,
      height: asset.height,
    });

    if (!validation.valid) {
      return { status: 'invalid', error: validation.message };
    }

    return { status: 'ok', uri: asset.uri };
  }

  return { permission, pickImage };
}
