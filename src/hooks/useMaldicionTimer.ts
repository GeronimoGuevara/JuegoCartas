import { useEffect, useState, useCallback } from 'react';
import { db } from '../db/db';
import type { EfectoActivo } from '../types';

interface MaldicionState {
  efectos: EfectoActivo[];
  agregarEfecto: (jugadorId: string, cartaId: string, rondas: number) => Promise<void>;
  tick: () => Promise<void>;
  tieneEfecto: (jugadorId: string) => boolean;
}

export function useMaldicionTimer(jugadorId: string): MaldicionState {
  const [efectos, setEfectos] = useState<EfectoActivo[]>([]);

  const cargarEfectos = useCallback(async () => {
    const efs = await db.efectos_activos.where('jugador_id').equals(jugadorId).toArray();
    setEfectos(efs);
  }, [jugadorId]);

  const agregarEfecto = useCallback(async (jid: string, cartaId: string, rondas: number) => {
    await db.efectos_activos.add({
      id: crypto.randomUUID(),
      jugador_id: jid,
      carta_id: cartaId,
      rondas_restantes: rondas,
    });
    await cargarEfectos();
  }, [cargarEfectos]);

  const tick = useCallback(async () => {
    const efs = await db.efectos_activos.where('jugador_id').equals(jugadorId).toArray();
    for (const e of efs) {
      await db.efectos_activos.update(e.id, { rondas_restantes: e.rondas_restantes - 1 });
    }
    const restantes = await db.efectos_activos.where('rondas_restantes').above(0).toArray();
    setEfectos(restantes);
  }, [jugadorId]);

  const tieneEfecto = useCallback((jid: string) => {
    return efectos.some((e) => e.jugador_id === jid && e.rondas_restantes > 0);
  }, [efectos]);

  useEffect(() => {
    cargarEfectos();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cargarEfectos, tick]);

  return { efectos, agregarEfecto, tick, tieneEfecto };
}
