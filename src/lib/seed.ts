import { supabase } from './supabase';
import { db } from '../db/db';
import { cartasExtraidas } from '../db/cartas_extraidas';
import type { Carta, Mazo, Categoria } from '../types';

export async function seedDatabase() {
  console.log('Iniciando seed de base de datos...');

  // 1. Definir Mazo Base
  const mazoBase: Mazo = {
    id: 'mazo-base-parejas-1',
    nombre: 'Noche de Parejas (Base)',
    descripcion: 'El mazo clásico con preguntas y retos íntimos para encender la noche.',
    es_oficial: true,
    sincronizado: true, // as it will be in Supabase
  };

  // 2. Definir Categorías Básicas
  const categoriasBase: Categoria[] = [
    {
      id: 'cat-preguntas',
      nombre: 'Confesiones',
      intensidad: 'chill',
      es_pareja: false,
      mecanica: 'estandar',
      descripcion: 'Preguntas para romper el hielo y conocerse mejor.',
    },
    {
      id: 'cat-retos-suaves',
      nombre: 'Juegos Previos',
      intensidad: 'picante',
      es_pareja: true,
      mecanica: 'estandar',
      descripcion: 'Caricias, besos y acercamientos.',
    },
    {
      id: 'cat-retos-hot',
      nombre: 'Acción Directa',
      intensidad: 'picante',
      es_pareja: true,
      mecanica: 'estandar',
      descripcion: 'Retos de alto voltaje.',
    },
  ];

  // 3. Preparar Cartas
  const cartasAInsertar: Carta[] = cartasExtraidas.map((c, index) => {
    let catId = 'cat-preguntas';
    if (c.tipo === 'reto') catId = 'cat-retos-suaves';
    if (c.tipo === 'hot') catId = 'cat-retos-hot';

    return {
      id: `carta-base-${index + 1}`,
      mazo_id: mazoBase.id,
      categoria_id: catId,
      contenido: c.texto,
      variables: {},
      duracion_rondas: 1,
      config: {},
      es_oficial: true,
      sincronizado: true,
      actualizado_en: Date.now(),
    };
  });

  try {
    console.log('Insertando en Dexie (Local)...');
    
    // Insertar en Dexie
    await db.mazos.put(mazoBase);
    await db.categorias.bulkPut(categoriasBase);
    await db.cartas.bulkPut(cartasAInsertar);
    
    // Auto-guardar el mazo para el usuario en Dexie
    await db.mazos_guardados.put({
      id: `guardado-${mazoBase.id}`,
      usuario_id: 'local',
      mazo_id: mazoBase.id,
      sincronizado: true
    });

    console.log('¡Dexie actualizado con éxito!');

    console.log('Insertando en Supabase (Remoto)...');
    
    // Insertar en Supabase (Mazo)
    const { error: errMazo } = await supabase.from('mazos').upsert({
      id: mazoBase.id,
      nombre: mazoBase.nombre,
      descripcion: mazoBase.descripcion,
      es_oficial: mazoBase.es_oficial,
    });
    if (errMazo) throw new Error('Error en mazo: ' + errMazo.message);

    // Insertar en Supabase (Categorias)
    for (const cat of categoriasBase) {
      const { error: errCat } = await supabase.from('categorias').upsert({
        id: cat.id,
        nombre: cat.nombre,
        intensidad: cat.intensidad,
        es_pareja: cat.es_pareja,
        mecanica: cat.mecanica,
        descripcion: cat.descripcion,
      });
      if (errCat) throw new Error('Error en categoria: ' + errCat.message);
    }

    // Insertar en Supabase (Cartas) en lotes de a 50
    const batchSize = 50;
    for (let i = 0; i < cartasAInsertar.length; i += batchSize) {
      const batch = cartasAInsertar.slice(i, i + batchSize);
      
      const supCartas = batch.map(c => ({
        id: c.id,
        mazo_id: c.mazo_id,
        categoria_id: c.categoria_id,
        contenido: c.contenido,
        variables: c.variables,
        duracion_rondas: c.duracion_rondas,
        config: c.config,
        es_oficial: c.es_oficial,
      }));

      const { error: errCartas } = await supabase.from('cartas').upsert(supCartas);
      if (errCartas) throw new Error(`Error en cartas lote ${i}: ` + errCartas.message);
    }

    console.log('¡Supabase actualizado con éxito!');
    alert('¡Seed completado! Mazo base insertado en Dexie y Supabase.');
    
  } catch (error: any) {
    console.error('Error durante el seed:', error);
    alert('Hubo un error al subir a Supabase:\n\n' + error.message);
  }
}
