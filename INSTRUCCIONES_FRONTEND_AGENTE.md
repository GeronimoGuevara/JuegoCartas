# Instrucciones de Frontend — Agente de Construcción de UI

> Este documento es la especificación visual y de interacción para el agente que va a
> construir las pantallas completas del juego. La base técnica (Dexie, Supabase, hook de
> sync, esqueleto de Home) ya existe en el repo — este .md se enfoca 100% en el frontend.
> Referencia funcional: `diseno-dinamicas-juego.md` (categorías, modos, esquema de datos).
> Referencia visual: capturas adjuntas (`POSIBLEINICIO.jpg`, `FRONTENDS1.jpg`, `FOTO_JUEGO_GEMINI__.jpg`).

---

## 🎯 ESTADO ACTUAL DEL PROYECTO (COMPLETADO Y PENDIENTE)

**✅ Completado (Infraestructura y UI Base):**
- **Rebranding "Noche de Cita":** Implementación total de la estética íntima (tonos oscuros, acentos carmesí/ámbar, tipografías Playfair/Inter, botones Glassmorphism, inputs elegantes).
- **Layouts e Interacción:** Estructuras de fondo fijo (`page-hero-bg`) solucionando problemas de scroll; navegación inferior ajustada para no solapar contenido; "Empty states" premium para listas vacías.
- **Base de Datos y Datos Iniciales:** Script de Seed (`seed.ts`) finalizado con 95 cartas extraídas y listas, sincronizando tanto en Dexie (offline) como en Supabase.
- **Pantallas construidas:** Inicio (`Home.tsx`), Mis Mazos (`MazePage.tsx`), Creador (`CreatorPage.tsx`), Setup de Partida (`SetupPage.tsx`) y Logros (`LogrosPage.tsx`).

**⏳ Pendiente (Motor de Juego y Jugabilidad):**
1. **Pantalla Principal de Juego (`PlayPage.tsx`):** Swipe de cartas (`CartaSwiper.tsx`), UI de carta activa, botones de Rebotar/Logrado.
2. **Lógica de Juego (`game-logic.ts`):** Algoritmo de "Mezcla" (pity-timer), resolución de variables dinámicas (`{jugador}`, `{pareja}`), y manejo de turnos.
3. **Mecánicas Especiales:** Duelos, Maldiciones (efectos persistentes en UI), Votación Secreta.
4. **Resumen Post-Partida (`SummaryPage.tsx`):** Pantalla final estilo Wrapped con estadísticas y botón de "Guardar recuerdos".

---

## 1. Sistema de diseño (tokens) - Estética "Noche de Cita"

### 1.1 Color

Paleta enfocada en intimidad, tensión sensual y calidez nocturna (fondo casi negro con degradados hacia púrpuras profundos, acentos carmesí y ámbar evocando la luz de las velas).

| Token | Hex | Uso |
|---|---|---|
| `--bg-base` | `#0F0712` | Fondo general de la app (oscuridad íntima) |
| `--bg-card` | `#1C0B24` | Fondo de tarjetas, inputs, bottom nav |
| `--bg-card-elevada` | `#2D0F32` | Modales, carta activa en juego |
| `--ambar` | `#FF9E00` | Acento cálido / brillo de vela / oro suave |
| `--carmesi` | `#FF2A54` | Acento "pasión" / CTA principal |
| `--rojo-oscuro` | `#E21B3C` | Secundario para gradientes |
| `--texto` | `#FCF8E8` | Texto principal (blanco con tono oro suave) |
| `--texto-muted` | `#D4A5B3` | Texto secundario, placeholders (rosa pálido) |

El degradé carmesí→rojo oscuro (`linear-gradient(90deg, var(--carmesi), var(--rojo-oscuro))`) es el elemento principal para el botón de llamada a la acción ("¡Enciende la chispa!").

### 1.2 Tipografía

- **Títulos y encabezados**: Tipografía elegante y sofisticada con curvas orgánicas, `Playfair Display` (o `Cinzel`), peso 600/700.
- **Cuerpo y lectura**: Tipografía sans-serif moderna, fluida y legible, `Inter` (o `Montserrat`), peso 400/500.
- Los textos principales llevan un ligero glow/text-shadow para simular el brillo del neón o las velas.

### 1.3 Layout

- Mobile-first estricto, un solo layout centrado (`max-width: 480px`), pensado para
  sostener el teléfono con una mano mientras se juega.
- Navegación inferior fija de 4 ítems (ver sección 3), visible en todas las pantallas
  post-onboarding: **Inicio · Mis Mazos · Creador · Ajustes**.
- Bordes redondeados consistentes: `18px` en tarjetas y botones grandes, `999px` (pill) en
  el banner de conexión y en botones de filtro rápido.
- Las cartas de juego son el elemento con más jerarquía visual de la app: ocupan casi todo
  el viewport, con swipe horizontal para navegar entre ellas (ver sección 4).

### 1.4 Principios

1. **Intimidad visual.** Uso de sombras densas, contrastes fuertes y efectos de glow en botones y cartas. Incorporar motivos sutiles de chispas o partículas de luz.
2. **Animaciones orgánicas (GSAP/CSS).** Las cartas se revelan con un deslizamiento suave y balanceo. El botón principal tiene un efecto de "latido" (pulso). Las transiciones de swipe son lentas y fluidas.
3. **Cero fricción para conectar.** El botón de inicio siempre visible. El diseño debe invitar a la conexión entre la pareja.

---

## 2. Banner de conexión (persistente)

- Pill fija arriba de cada pantalla, fondo `rgba(255,255,255,0.06)`, ícono + texto.
- Online: `🟢 Conectado`. Offline: `⚪ Offline / Desconectado` (ver `FRONTENDS1.jpg` /
  `FOTO_JUEGO_GEMINI__.jpg` para la referencia exacta del wording).
- Si hay cartas sin sincronizar, agregar a la derecha `N cartas por subir` (o
  `Sincronizando…` mientras `useOfflineSync().isSyncing === true`). Nunca bloquear la UI
  por esto.

---

## 3. Navegación inferior

4 ítems fijos, ícono + label chico, activo resaltado con el color `--magenta`:

1. **Inicio** — Home (ya implementado en `src/pages/Home.tsx`)
2. **Mis Mazos** — grilla de mazos (ver sección 4.1)
3. **Creador** (ícono `+`) — formulario de creación de cartas (sección 4.2)
4. **Ajustes** — ajustes de partida / cuenta

---

## 4. Pantallas a construir

### 4.1 Elegir Mazos (`/mazos`)

Grilla de 2 columnas con tarjetas de mazo (ver `FRONTENDS1.jpg`, panel izquierdo):

- Cada tarjeta: ícono/emoji grande del mazo, nombre, contador de cartas (`(60)`), estado
  chill/picante como acento de borde (cyan/magenta).
- Toggle "Modo Offline" arriba a la derecha de la grilla — refleja `sync.isOnline` pero
  además permite forzar trabajar solo con lo ya descargado.
- Al fondo, botón fijo `¡Empezar Partida! 🔥` (gradiente cian→magenta) que lleva a la
  configuración de partida si el modo es Personalizado, o directo al juego si es Picante.
- Selección múltiple de mazos con check visual (borde + check icon) antes de habilitar el
  botón de empezar.

### 4.2 Creador de Cartas (`/creador`)

Formulario simple de una sola pantalla (ver `FRONTENDS1.jpg`, panel derecho):

- Textarea grande "Borrador" con placeholder que muestre un ejemplo real con variable,
  ej.: `Si {jugador} pierde el piedra, papel o tijera, tiene que…`
- Select "Tipo de carta": Reto / Pregunta / Castigo (mapea a `categoria_id` → mecánica).
- Select "Baraja de destino": lista de mazos existentes (incluye "Creados por mí").
- Indicador chico `📱 Guardado en el teléfono (Offline)` cuando no hay conexión — deja
  clarísimo que la carta se guarda igual y se sube después.
- Botón `Crear y Añadir al Mazo +`: al confirmar, llama a `crearCartaLocal()` (ya
  implementado en `src/db/db.ts`), limpia el formulario y muestra un toast breve de
  confirmación (sin bloquear con un modal).

### 4.3 Pantalla de Juego — Carta Activa (`/jugar`)

La pantalla más importante, ver `FOTO_JUEGO_GEMINI__.jpg` y el panel central de
`FRONTENDS1.jpg`:

- Carta centrada, borde con el gradiente cian→magenta, esquinas redondeadas grandes.
- Etiqueta de categoría arriba de la carta en una pill pequeña (ej. `RETO DE EQUIPO`,
  `PREGUNTA PICANTE`) — color de la pill según intensidad (cyan = chill, magenta = picante).
- Contenido de la carta centrado, tipografía grande y legible a distancia de mesa
  (mínimo `1.1rem`), con las variables (`{jugador_al_azar}`, etc.) ya resueltas a un
  nombre real antes de renderizar — nunca mostrar el placeholder crudo.
- Ilustración simple/ícono decorativo debajo del texto (estilo flat-illustration como en
  las referencias), opcional según categoría.
- Navegación: flechas `‹ ›` a los costados + swipe horizontal nativo para pasar a la
  siguiente carta. Puntitos indicadores debajo de la carta (posición N de M restantes en
  el mazo de esa partida).
- Dos botones debajo de la carta: `Rebotar 🔁` (descarta y pide otra sin penalidad) y
  `Logrado ✅` (marca la carta como cumplida, actualiza `estadisticas_partida` si
  corresponde a un duelo/maldición).
- Si la carta es de categoría `maldicion`, mostrar un ícono persistente flotante (esquina
  superior) mientras `efectos_activos.rondas_restantes > 0` para ese jugador.

### 4.4 Setup de Partida — Modo Personalizado

Wizard corto de 3 pasos (no una sola pantalla larga, para no abrumar antes de jugar):

1. **Filtros rápidos**: 3 botones grandes tipo pill — `Solo Chill` / `Solo Picante` /
   `Mezcla` — y debajo, un link secundario "Elegir categorías a mano" que despliega el
   checklist manual (ver categorías en `diseno-dinamicas-juego.md` sección 2).
2. **Jugadores**: input de cantidad + lista dinámica de campos de nombre (uno por
   jugador). Mínimo 2. Botón `+ Agregar jugador`.
3. **Confirmación**: resumen (mazo(s), filtro, jugadores) + botón grande `¡Empezar!`.

Si el usuario vino del Modo Picante, saltar directo al paso 2 con todas las categorías
pre-seleccionadas.

### 4.5 Resumen de la Noche (post-partida)

Pantalla estilo "Wrapped" (sección 5 del doc de dinámicas):

- Carrusel de 3-4 tarjetas, una estadística destacada por tarjeta (número grande +
  nombre del jugador), ej: "🔥 Más maldiciones: Fede (4)", "🏆 Más duelos ganados: Vale (3)".
- Si es Modo Parejas 1v1, tarjeta extra "💞 Sincronía de pareja: 82%".
- Botón final `Guardar recuerdos` que persiste las 3 cartas más votadas como graciosas en
  `cartas_recordadas` (Modo Recuerdo).

---

## 5. Microcopy (tono sugerente e íntimo)

- Nombres de botones y secciones con tono confidente y pícaro: "¡Enciende la chispa!" (reemplaza a "¡A Jugar!"), "Atrevimientos", "Tensión & Deseo", "Fantasías".
- Textos de estado: "El ambiente se está calentando..." en vez de "Cargando mazos...".
- El estado offline se explica manteniendo la privacidad: "Solo tú y tu pareja (Offline)".

---

## 5.5 Animaciones y Microinteracciones (CSS/GSAP)

- **Latido**: El botón principal ("¡Enciende la chispa!") debe usar una animación `heartbeat` con cambios de escala (1 a 1.05) y box-shadow intermitente en tonos carmesí.
- **Fade-in fluido**: Al cargar la app o abrir cartas, usar transformaciones suaves (`translateY` + `opacity`) y duraciones lentas (0.6s - 0.8s) para transmitir inercia y sensualidad.
- **Glow**: Elementos interactivos deben emitir un resplandor cálido (`box-shadow: 0 0 15px rgba(255, 158, 0, 0.3)`) al pasar el cursor o hacer tap.

## 6. Componentes a extraer (sugerido, no obligatorio)

```
src/components/
├── OfflineBanner.tsx      # pill de conexión, usada en todas las pantallas
├── BottomNav.tsx          # navegación inferior de 4 ítems
├── CartaSwiper.tsx        # carrusel swipeable de cartas en /jugar
├── MazoCard.tsx           # tarjeta de mazo en /mazos
├── FiltroRapidoPills.tsx  # Solo Chill / Solo Picante / Mezcla
└── ResumenNocheCard.tsx   # tarjeta de estadística en el resumen final
```

Cada componente debe recibir sus datos por props (ya resueltos desde Dexie en el
componente padre) — no acceder a `db` directamente desde componentes de presentación.
