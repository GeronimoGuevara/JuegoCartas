# Noche de Juego — PWA Offline-First

Plantilla base: React + Vite + TypeScript, Dexie.js (IndexedDB) para el almacenamiento
local y Supabase opcional para sincronizar cartas creadas por los usuarios.

## Arrancar

```bash
npm install
cp .env.example .env   # completar con tu proyecto de Supabase (opcional)
npm run dev
```

## Estructura

```
src/
├── types/index.ts        # Tipos de dominio (Categoria, Carta, Mazo)
├── db/db.ts               # Esquema Dexie.js (espejo Supabase + sesión local)
├── lib/supabase.ts        # Cliente Supabase
├── hooks/useOfflineSync.ts # online/offline + subida de cartas pendientes
├── pages/Home.tsx         # Pantalla de inicio
├── App.tsx / main.tsx
└── styles/global.css
```

## Qué es local y qué se sincroniza

- **Se sincroniza** (`categorias`, `cartas`, `mazos`, `mazos_guardados`): mismo
  esquema que en Supabase. Las cartas creadas offline nacen con
  `sincronizado: false` y `useOfflineSync` las sube en cuanto vuelve la red.
- **100% local, nunca se sube** (`partida_actual`, `jugadores_partida`,
  `efectos_activos`, `logros_locales`, `estadisticas_partida`,
  `cartas_recordadas`): son datos efímeros de la noche de juego, tal como
  define `diseno-dinamicas-juego.md` sección 6.2.

## Siguiente paso

Ver `INSTRUCCIONES_FRONTEND_AGENTE.md` para el detalle de UI/UX que tiene que
implementar el agente que construya las pantallas completas (setup de
partida, mazo, creador de cartas, modo juego, etc.), inspirado en las
imágenes de referencia.
