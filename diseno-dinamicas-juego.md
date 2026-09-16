# Diseño de Dinámicas de Juego — PWA Party Game

> Complementa el "Plan Maestro" técnico. Este documento define las categorías de cartas, modos de juego y mecánicas seleccionadas para el diseño final.

---

## 1. Modos de Juego

### 🌶️ Modo Picante
Modo "todo incluido". Al seleccionarlo, la app carga **automáticamente todas las categorías de cartas disponibles** (chill + picantes + de pareja), sin necesidad de configuración previa. Pensado para jugar directo, sin fricción.

### 🎛️ Modo Personalizado
El jugador que arma la partida tiene control total antes de empezar:

1. **Filtros rápidos** (presets de un toque):
   - Solo Chill (sin contenido picante/de pareja)
   - Solo Picante
   - Mezcla (balance automático entre ambas, ver lógica abajo)
2. **Selección manual**: elegir una por una qué categorías entran al mazo de la partida (checklist de categorías).
3. **Configuración de jugadores**:
   - Ingreso de **cantidad de jugadores**.
   - Ingreso de **nombre** de cada jugador (usado luego en las cartas con variables tipo `{jugador_al_azar}`).

**Nota de implementación:** cada categoría de carta necesita un tag de "intensidad" (`chill` / `picante`) en la tabla `cartas` de Supabase para que el filtro rápido funcione sin lógica manual por carta.

#### Lógica del preset "Mezcla" (proporción con aleatoriedad controlada)

Objetivo: que **en promedio** al menos 1 de cada 3 cartas sea picante, pero **sin patrón fijo** (nunca "la carta 3, 6, 9..."), para que el mazo no se vuelva predecible.

Enfoque: **peso dinámico con pity-timer suave**, en vez de módulo fijo o probabilidad fija e independiente:

1. Cada carta a repartir tiene una probabilidad base de ser picante (ej. `p_base ≈ 33%`).
2. Se lleva un contador de "cartas chill consecutivas desde la última picante" (`racha`).
3. La probabilidad real de que la próxima carta sea picante sube levemente con cada carta chill que pasa: `p_real = min(p_base + racha * incremento, p_max)` (ej. `incremento = 5%`, `p_max = 70%`).
4. Al salir una carta picante, `racha` vuelve a 0 y la probabilidad baja de nuevo a `p_base`.
5. Esto garantiza que **nunca se disparen rachas larguísimas sin picante** (el "pity timer" empuja la probabilidad hacia arriba), pero tampoco genera el patrón rígido de "cada 3 cartas" — el resultado exacto sigue siendo aleatorio, solo que ponderado.

Ejemplo de comportamiento esperado en una tirada de 12 cartas: podrían salir picantes en las posiciones 2, 3, 7, 10 (o cualquier otra combinación), nunca exactamente cada 3, pero manteniendo el promedio general cerca de 1/3.

---

## 2. Categorías de Cartas Seleccionadas

| Categoría | Intensidad | Descripción |
|---|---|---|
| **Maldiciones / Efectos Globales** | Chill | Afecta a un jugador por N rondas (ej. "no podés decir 'sí'"). Se trackea con un ícono persistente en su pantalla mientras dure el efecto. |
| **Duelo Relámpago** | Chill | Dos jugadores compiten en algo cronometrado (mímica, rima, memoria); el perdedor cumple la carta. |
| **Carta Espejo** | Chill | Un jugador obliga a otro a hacer algo de una lista corta generada por la app. |
| **Química Confirmada** | Picante | Preguntas sobre atracción/conexión reciente; se puede responder solo con gestos o miradas. |
| **Termómetro** | Picante | Cada uno califica en privado (1–10) algo del otro; se revela a la vez, efecto tipo "match". |
| **Recuerdos Prohibidos** | Picante | Evocar anécdotas atrevidas de la pareja sin dar detalles explícitos. |
| **Zona de Contacto** | Picante | Retos de cercanía física suave (bailar pegados, susurrar al oído) con temporizador. |

---

## 3. Modo Parejas 1v1
Versión de dos jugadores donde el mazo se filtra automáticamente hacia categorías de intimidad/complicidad. Usa mazos separados:
- **Picante suave**
- **Romántico**

Se integra de forma natural con el Modo Personalizado (preset "Mezcla" orientado a pareja) o puede activarse como modo de partida independiente.

---

## 4. Mecánica Offline: El Teléfono como Árbitro
Uso del sensor de movimiento/inclinación del dispositivo para minijuegos tipo "no tiembles" (sostener el teléfono quieto durante X segundos), sin depender de conexión a internet. Funciona como validador imparcial de retos físicos.

---

## 5. Gamificación y Retención

- **Estadísticas de la noche**: al cerrar la partida, resumen tipo "Spotify Wrapped" — quién recibió más maldiciones, quién ganó más duelos, "pareja más sincronizada" (relevante también en Modo Parejas 1v1).
- **Logros locales** (guardados en Dexie.js, sin necesitar red): ej. "Sobrevivió 3 bombas de tiempo seguidas", "Impostor perfecto 3 veces".
- **Modo Recuerdo**: guarda automáticamente (localmente) las 3 cartas más graciosas de la noche para revivirlas después.

---

## 6. Esquema de Tablas

### 6.1 Supabase (nube) — normalizado, sincronizado

**`categorias`** *(nueva, reemplaza el enum simple de `tipo`)*
| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID (PK) | |
| `nombre` | Varchar | ej. "Maldiciones", "Termómetro" |
| `intensidad` | Enum(`chill`, `picante`) | Usado por los filtros rápidos del Modo Personalizado |
| `es_pareja` | Bool | true para categorías propias del Modo Parejas 1v1 |
| `mecanica` | Enum(`estandar`, `maldicion`, `duelo`, `espejo`, `votacion_secreta`, `termometro`) | Define qué componente/lógica de UI dispara la carta |
| `descripcion` | Text | |

**`cartas`** *(actualizada)*
| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID (PK) | |
| `mazo_id` | UUID (FK → `mazos.id`) | |
| `categoria_id` | UUID (FK → `categorias.id`) | Reemplaza el `tipo` enum plano del plan original |
| `contenido` | Text | Texto de la carta, con placeholders tipo `{jugador_al_azar}` |
| `variables` | JSONB | Lista de variables usadas en `contenido` y su tipo (`jugador_al_azar`, `numero`, `pareja_jugando`, etc.) |
| `duracion_rondas` | Int (nullable) | Solo aplica a cartas de categoría `maldicion` |
| `config` | JSONB (nullable) | Parámetros específicos de la mecánica (ej. tiempo del duelo, rango del termómetro) |
| `es_oficial` | Bool | Si es del mazo base o creada por un usuario |
| `creador_id` | UUID (FK → `usuarios.id`, nullable) | |

**`mazos`** y **`mazos_guardados`**: sin cambios respecto al Plan Maestro original.

### 6.2 Dexie.js (local, no se sincroniza) — sesión de partida y datos efímeros de la noche

**`partida_actual`**
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string (uuid local) | |
| `modo` | `'picante' \| 'personalizado'` | |
| `filtro_personalizado` | `'chill' \| 'picante' \| 'mezcla' \| 'manual'` (nullable) | Solo si `modo = 'personalizado'` |
| `categorias_activas` | string[] (ids) | Categorías incluidas en el mazo de esta partida |
| `es_modo_parejas` | boolean | |
| `iniciada_en` | timestamp | |

**`jugadores_partida`**
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | |
| `partida_id` | string (FK local) | |
| `nombre` | string | Ingresado en la configuración de partida |
| `orden` | int | Orden de turno |
| `racha_picante` | int | **Definido: a nivel de jugador.** Cada jugador lleva su propio contador para el algoritmo de "Mezcla" — implica que cada jugador extrae de su propio pool de cartas (no un mazo central único repartido por turno) |

**`efectos_activos`** *(maldiciones en curso)*
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | |
| `jugador_id` | string (FK local) | |
| `carta_id` | string | |
| `rondas_restantes` | int | Se decrementa cada ronda; al llegar a 0 se borra y desaparece el ícono persistente |

**`logros_locales`**
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | |
| `nombre` | string | ej. "Impostor perfecto 3 veces" |
| `desbloqueado_en` | timestamp (nullable) | null = todavía no desbloqueado |
| `progreso` | int | Para logros acumulativos |

**`estadisticas_partida`** *(insumo del resumen tipo "Spotify Wrapped")*
| Campo | Tipo | Notas |
|---|---|---|
| `partida_id` | string | |
| `jugador_id` | string | |
| `maldiciones_recibidas` | int | |
| `duelos_ganados` | int | |
| `duelos_perdidos` | int | |
| `sincronia_pareja` | int (nullable) | Solo Modo Parejas 1v1 — ej. % de coincidencia en Termómetro |

**`cartas_recordadas`** *(Modo Recuerdo)*
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | |
| `partida_id` | string | |
| `carta_id` | string | |
| `motivo` | string (nullable) | Opcional: por qué quedó guardada (votada como "más graciosa", etc.) |

---

## 7. Pendiente de definir
- Tabla/estructura exacta de configuración de partida (jugadores + modo + categorías) antes de iniciar el mazo activo. *(resuelto arriba en 6.2 — falta validar contra la UI real de la pantalla de setup)*
- ~~Si `racha_picante` vive a nivel partida o jugador~~ → **Definido: a nivel de jugador.** Esto implica que cada jugador tiene su propio pool de cartas (extrae de un subconjunto propio, no de un mazo central único). Falta definir cómo se arma ese pool por jugador: ¿se le asigna un subconjunto barajado al azar al iniciar la partida? ¿se recalcula dinámicamente para evitar que dos jugadores reciban la misma carta en la noche?
