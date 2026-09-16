# PWA Juego de Cartas — Instrucciones para Agentes

## Stack Tecnológico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | React 18 + TypeScript | JSX con `react-jsx`, strict mode |
| Build | Vite 5 | Plugin React + VitePWA |
| Estado local | Dexie.js (IndexedDB) | Offline-first, 12 tablas |
| Sync nube | Supabase (opcional) | Solo cartas/mazos, fallback offline |
| PWA | vite-plugin-pwa | Service Worker + manifest, autoUpdate |
| Routing | React Router (pendiente instalar) | Historia hash, mobile-first |
| Tipos | TypeScript estricto | `noUnusedLocals`, `noUnusedParameters` |

## Base de Conocimiento

- `diseno-dinamicas-juego.md` — Categorías de cartas, modos de juego, esquema de datos, mecánicas (Mezcla, maldiciones, duelos, termómetro)
- `INSTRUCCIONES_FRONTEND_AGENTE.md` — Sistema de diseño (tokens), pantallas a construir, microcopy, componentes a extraer
- `README.md` — Estructura del proyecto y guía de arranque

## Skills Disponibles

| Skill | Trigger | Rol |
|-------|---------|-----|
| `agents-md-generator` | `/agents-md`, "armar reglas" | Genera AGENTS.md / CLAUDE.md |
| `kb-creator` | `/kb-creator`, "crear KB" | Base de conocimiento estructurada |
| `roadmap-generator` | `/roadmap`, "armar CHANGES" | CHANGES.md — índice de cambios |
| `jr-orchestrator` | `/jr-orchestrator` | Orquesta flujo fundacional |
| `skill-creator` | `/skill-creator` | Crear/mejorar skills |
| `skill-registry` | `/skill-registry` | Registro de skills |
| `tdd` | `/tdd`, "red-green-refactor" | Desarrollo TDD |
| `systematic-debugging` | Bug, test failure | Debugging sistemático |
| `improve-codebase-architecture` | Mejorar arquitectura | Refactoring profundo |

> Los compact rules de cada skill las resuelve el orquestador desde `.atl/skill-registry.md` (generado por `skill-registry`; no versionado).

## Reglas Duras (específicas del proyecto)

> Reglas globales ya definidas: el proyecto no tiene `~/.claude/CLAUDE.md`. Acá viven todas las reglas del proyecto.

### Diseño y UI
- **NUNCA** usar gradientes distintos al cian→magenta (`linear-gradient(90deg, var(--cyan), var(--magenta))`). Solo para botón "¡A Jugar!" y borde de carta activa.
- **NUNCA** mezclar tipografías. Una sola familia: Poppins/system-ui, títulos peso 700, cuerpo 400/500.
- **NUNCA** mostrar placeholders crudos (`{jugador_al_azar}`) — resolver variables antes de renderizar.
- **NUNCA** usar mayúsculas forzadas en labels ni "eyebrows" tipo `SECCIÓN — subtítulo`.
- **SIEMPRE** mobile-first con `max-width: 480px`, un solo layout centrado.
- **SIEMPRE** usar los tokens CSS definidos en `global.css` (`--bg-base`, `--bg-card`, `--cyan`, `--magenta`, `--texto`, `--texto-muted`, `--radio: 18px`).
- **SIEMPRE** bordes redondeados: `18px` para tarjetas/botones grandes, `999px` para pills.

### Código
- **NUNCA** usar `any` en TypeScript. Todos los tipos deben estar definidos.
- **NUNCA** acceder a `db` directamente desde componentes de presentación — pasar datos por props desde el componente padre.
- **SIEMPRE** componentes por props (ya resueltos desde Dexie).
- **SIEMPRE** usar `@/` como alias para imports (configurado en tsconfig y vite.config).
- **SIEMPRE** nombres de componentes en PascalCase, hooks con `use` prefix.
- **SIEMPRE** botones en voz activa: "¡A Jugar!", "Crear y Añadir al Mazo", "Guardar recuerdos" — nunca "Enviar" ni "Confirmar".
- **SIEMPRE** estados vacíos como invitación: "Todavía no hay mazos descargados..." — nunca "No data available".

### Datos y DB
- **NUNCA** sincronizar tablas de sesión (`partida_actual`, `jugadores_partida`, `efectos_activos`, `logros_locales`, `estadisticas_partida`, `cartas_recordadas`) — son 100% locales por diseño.
- **SIEMPRE** cartas creadas offline nacen con `sincronizado: false`.
- **SIEMPRE** el algoritmo "Mezcla" usa pity-timer ponderado por jugador (racha a nivel de `JugadorPartida`), no a nivel de partida.

### Navegación
- **SIEMPRE** bottom nav fijo de 4 ítems: Inicio · Mis Mazos · Creador · Ajustes.
- **SIEMPRE** banner de conexión pill arriba de cada pantalla (online/offline + pendientes).
- **SIEMPRE** orientación portrait (`display: standalone`, `orientation: portrait`).

### Animaciones
- **NUNCA** más de un gesture de motion por momento. Swipe de carta y flip de "revelar respuesta" son las únicas animaciones con peso.
- **NUNCA** fade-in escalonado en listas.

## Flujo de Trabajo

1. **Leer** `diseno-dinamicas-juego.md` + `INSTRUCCIONES_FRONTEND_AGENTE.md` antes de codear cualquier pantalla o mecánica.
2. **Tipos primero** — actualizar `src/types/index.ts` antes de tocar DB o componentes.
3. **DB segundo** — actualizar `src/db/db.ts` con nuevas tablas/interfaces.
4. **Componentes** — crear en `src/components/` con props, sin acceso directo a `db`.
5. **Páginas** — crear en `src/pages/`, rutas configuradas en `src/App.tsx`.
6. **Mecánicas** — lógica pura en `src/lib/` (algoritmo Mezcla, resolvedor de variables, cálculo de estadísticas).
7. **Testing** — ejecutar `npm run build` y `npx tsc --noEmit` para verificar tipos.
8. **PWA** — verificar que el service worker precachee todo con `npm run dev`.

## Estructura de Archivos

```
src/
├── types/index.ts          # Tipos de dominio (Categoria, Carta, Mazo, etc.)
├── db/db.ts                # Esquema Dexie.js + helpers (crearCartaLocal)
├── lib/
│   ├── supabase.ts         # Cliente Supabase
│   └── game-logic.ts       # Algoritmo Mezcla, resolvedor de variables (por crear)
├── hooks/
│   ├── useOfflineSync.ts   # Online/offline + subida de cartas
│   └── useMotionSensor.ts  # Sensor de movimiento para árbitro offline (por crear)
├── components/             # Componentes reutilizables (por crear)
│   ├── OfflineBanner.tsx
│   ├── BottomNav.tsx
│   ├── CartaSwiper.tsx
│   ├── MazoCard.tsx
│   ├── FiltroRapidoPills.tsx
│   └── ResumenNocheCard.tsx
├── pages/                  # Pantallas (por crear/mejorar)
│   ├── Home.tsx            # ✅ Existe
│   ├── MazePage.tsx        # /mazos — por crear
│   ├── SetupPage.tsx       # /setup — por crear
│   ├── CreatorPage.tsx     # /creador — por crear
│   ├── PlayPage.tsx        # /jugar — por crear
│   └── SummaryPage.tsx     # /resumen — por crear
├── styles/global.css       # Tokens CSS + estilos base
├── App.tsx                 # Router + shell
├── main.tsx                # Entry point
└── vite-env.d.ts           # Vite env types
```

## Roadmap de Changes

Sin CHANGES.md. Ver `diseno-dinamicas-juego.md` y `INSTRUCCIONES_FRONTEND_AGENTE.md` para el alcance completo.

Fases de implementación:
1. **Infraestructura** — Router, tipos completos, helpers DB, game-logic module
2. **Componentes base** — Todos los componentes UI listados en INSTRUCCIONES_FRONTEND_AGENTE.md
3. **Páginas** — Setup, Mazos, Creador, Jugar, Resumen
4. **Mecánicas** — Mezcla, Maldiciones, Duelos, Termómetro, Espejo, Votación
5. **Modo Parejas** — Filtros 1v1, sincronía
6. **Offline referee** — Sensor de movimiento
7. **Gamificación** — Stats, logros, Modo Recuerdo
8. **PWA polish** — Manifest, icons, orientación
9. **Integración** — Routing completo, testing, build

## PWA Manifest

- Nombre: `Noche de Juego — Cartas, Retos y Preguntas`
- Short name: `NocheDeJuego`
- Theme color: `#0f0a1f`
- Orientation: `portrait`
- Icons: `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`
- Service Worker: precachea build + runtime caching para imágenes

## Variables de Entorno

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

Si no están seteadas, la app funciona 100% offline (sin sync a Supabase).
