import { useCallback, useEffect, useState } from 'react';
import { db } from '../db/db';
import { supabase } from '../lib/supabase';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendientes: number;
  ultimaSync: number | null;
  error: string | null;
}

/**
 * Escucha online/offline y sube a Supabase las cartas creadas localmente
 * (sincronizado=false). No toca nada de la sesión de partida (esas tablas
 * son locales por diseño, ver diseno-dinamicas-juego.md sección 6.2).
 */
export function useOfflineSync() {
  const [state, setState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendientes: 0,
    ultimaSync: null,
    error: null,
  });

  const actualizarConteoPendientes = useCallback(async () => {
    const total = await db.cartas.filter((c) => !c.sincronizado).count();
    setState((prev) => ({ ...prev, pendientes: total }));
  }, []);

  const sincronizarAhora = useCallback(async () => {
    if (!navigator.onLine) return;

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const cartasPendientes = await db.cartas.filter((c) => !c.sincronizado).toArray();

      for (const carta of cartasPendientes) {
        const { error } = await supabase.from('cartas').upsert({
          id: carta.id,
          mazo_id: carta.mazo_id,
          categoria_id: carta.categoria_id,
          contenido: carta.contenido,
          variables: carta.variables ?? {},
          duracion_rondas: carta.duracion_rondas ?? null,
          config: carta.config ?? {},
          es_oficial: carta.es_oficial,
          creador_id: carta.creador_id ?? null,
        });

        // Si falla una carta puntual (ej. sin red a mitad de camino) la
        // dejamos pendiente y seguimos con las demás; se reintenta en el
        // próximo online/llamado manual.
        if (!error) {
          await db.cartas.update(carta.id, { sincronizado: true });
        }
      }

      await actualizarConteoPendientes();
      setState((prev) => ({ ...prev, isSyncing: false, ultimaSync: Date.now() }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Error desconocido al sincronizar',
      }));
    }
  }, [actualizarConteoPendientes]);

  useEffect(() => {
    actualizarConteoPendientes();

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      sincronizarAhora();
    };
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [actualizarConteoPendientes, sincronizarAhora]);

  return { ...state, sincronizarAhora };
}
