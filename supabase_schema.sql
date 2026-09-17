-- Script para crear las tablas base en Supabase.
-- Puedes copiar y pegar todo esto en el SQL Editor de tu panel de Supabase.

-- 1. Tabla de Mazos
CREATE TABLE IF NOT EXISTS public.mazos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    es_oficial BOOLEAN DEFAULT false,
    creador_id TEXT
);

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categorias (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    intensidad TEXT NOT NULL, -- 'chill' o 'picante'
    es_pareja BOOLEAN DEFAULT false,
    mecanica TEXT DEFAULT 'estandar',
    descripcion TEXT
);

-- 3. Tabla de Cartas
CREATE TABLE IF NOT EXISTS public.cartas (
    id TEXT PRIMARY KEY,
    mazo_id TEXT REFERENCES public.mazos(id) ON DELETE CASCADE,
    categoria_id TEXT REFERENCES public.categorias(id) ON DELETE RESTRICT,
    contenido TEXT NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb,
    duracion_rondas INTEGER DEFAULT 1,
    config JSONB DEFAULT '{}'::jsonb,
    es_oficial BOOLEAN DEFAULT false,
    creador_id TEXT
);

-- 4. Permisos Básicos (Row Level Security)
-- Activar RLS en todas las tablas
ALTER TABLE public.mazos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartas ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (cualquiera puede leer)
CREATE POLICY "Permitir lectura pública de mazos" ON public.mazos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de cartas" ON public.cartas FOR SELECT USING (true);

-- Políticas de inserción y actualización (para permitir que los clientes anónimos suban sus cartas creadas offline)
-- Nota: En un entorno de producción estricto, esto debería estar protegido por autenticación,
-- pero como la app permite crear cartas de forma anónima offline, dejamos el INSERT abierto.
CREATE POLICY "Permitir inserción anónima de cartas" ON public.cartas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización anónima de cartas" ON public.cartas FOR UPDATE USING (true);
CREATE POLICY "Permitir inserción anónima de mazos" ON public.mazos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización anónima de mazos" ON public.mazos FOR UPDATE USING (true);
