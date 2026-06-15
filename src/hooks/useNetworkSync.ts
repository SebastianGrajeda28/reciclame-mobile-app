import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import {
  syncPendingRecords,
  refreshStaleContentCaches,
} from '@/src/services/sync/syncService';

/**
 * Escucha cambios de conectividad. Al reconectar:
 * 1. Sube los registros de reciclaje pendientes a Supabase.
 * 2. Actualiza las cachés vencidas (fun facts, instrucciones, puntos).
 * Debe montarse una única vez en el nivel raíz de la app (dentro de AppGate).
 */
export function useNetworkSync(): void {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log(`[NET] Conectividad: isConnected=${state.isConnected}, type=${state.type}`);
      if (state.isConnected) {
        console.log('[NET] Hay red — sincronizando datos y refrescando caches...');
        syncPendingRecords().catch((e) => console.warn('[NET] Error en sync:', e));
        refreshStaleContentCaches().catch((e) => console.warn('[NET] Error en refresco:', e));
      } else {
        console.log('[NET] Sin conexion — modo offline activo');
      }
    });
    return unsubscribe;
  }, []);
}
