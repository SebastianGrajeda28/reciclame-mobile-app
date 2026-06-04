import { Alert } from 'react-native';
import { router } from 'expo-router';

import { routes } from '@/src/constants/routes';
import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';

/**
 * Confirma la cancelación de la captura: descarta el estado del flujo y vuelve al Home.
 * @returns confirmCancel — abre el diálogo de confirmación nativo.
 */
export function useCancelCapture() {
  const { resetFlow } = useRecycleFlow();

  function confirmCancel() {
    Alert.alert('¿Salir?', 'Se descartará la captura actual.', [
      { text: 'Continuar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          resetFlow();
          router.replace(routes.home);
        },
      },
    ]);
  }

  return { confirmCancel };
}
