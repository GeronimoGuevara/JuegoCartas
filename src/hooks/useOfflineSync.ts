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

  const descargarCatalogoOficial = useCallback(async () => {
    if (!navigator.onLine) return;
    
    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      // 1. Descargar Mazos oficiales
      const { data: mazosOficiales, error: errMazos } = await supabase.from('mazos').select('*').eq('es_oficial', true);
      if (errMazos) throw errMazos;
      
      // 2. Descargar Categorías
      const { data: categorias, error: errCat } = await supabase.from('categorias').select('*');
      if (errCat) throw errCat;

      // 3. Descargar Cartas oficiales
      const { data: cartasOficiales, error: errCartas } = await supabase.from('cartas').select('*').eq('es_oficial', true);
      if (errCartas) throw errCartas;

      // 4. Guardar en Dexie
      if (mazosOficiales) {
        await db.mazos.bulkPut(mazosOficiales.map(m => ({ ...m, sincronizado: true })));
      }
      if (categorias) {
        await db.categorias.bulkPut(categorias);
      }
      if (cartasOficiales) {
        await db.cartas.bulkPut(cartasOficiales.map(c => ({
          ...c,
          sincronizado: true,
          actualizado_en: Date.now()
        })));
      }

      setState((prev) => ({ ...prev, isSyncing: false, ultimaSync: Date.now() }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Error al descargar catálogo',
      }));
    }
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

        if (!error) {
          await db.cartas.update(carta.id, { sincronizado: true });
        }
      }

      await actualizarConteoPendientes();
      
      // Intentar descargar novedades oficiales (mazos nuevos, etc)
      await descargarCatalogoOficial();
      
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Error desconocido al sincronizar',
      }));
    }
  }, [actualizarConteoPendientes, descargarCatalogoOficial]);

  useEffect(() => {
    actualizarConteoPendientes();

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      sincronizarAhora();
    };
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Arrancar una descarga inicial silenciosa si estamos online
    if (navigator.onLine) {
      descargarCatalogoOficial();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [actualizarConteoPendientes, sincronizarAhora, descargarCatalogoOficial]);

  return { ...state, sincronizarAhora, descargarCatalogoOficial };
}
