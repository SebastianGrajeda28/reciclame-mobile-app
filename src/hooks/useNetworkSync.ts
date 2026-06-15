import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { syncPendingRecords } from '@/src/services/sync/syncService';

/**
 * Escucha cambios de conectividad. Cuando hay red, sincroniza automáticamente
 * los registros de reciclaje pendientes de subir a Supabase.
 * Debe montarse una única vez en el nivel raíz de la app (dentro de AppGate).
 */
export function useNetworkSync(): void {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log(`[NET] Conectividad: isConnected=${state.isConnected}, type=${state.type}`);
      if (state.isConnected) {
        console.log('[NET] Hay red — iniciando sincronizacion de pendientes...');
        syncPendingRecords().catch((e) => console.warn('[NET] Error en sync:', e));
      } else {
        console.log('[NET] Sin conexion — modo offline activo');
      }
    });
    return unsubscribe;
  }, []);
}
