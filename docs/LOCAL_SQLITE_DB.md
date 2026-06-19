# Base de datos local SQLite

La app usa `expo-sqlite` para mantener datos en el dispositivo. El archivo se llama `reciclame.db` y se abre como singleton en `src/services/db/index.ts`.

Modo WAL activado (`PRAGMA journal_mode = WAL`) para lecturas concurrentes sin bloquear escrituras.

---

## Tablas

### `recycling_records`

Registros de reciclaje del usuario. Es la única tabla de **escritura propia** (no cache); los datos se crean en el dispositivo y se suben a Supabase cuando hay red.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | TEXT PK | UUID generado con `expo-crypto.randomUUID()` |
| `user_id` | TEXT NOT NULL | UID del usuario autenticado en Supabase |
| `waste_type_id` | TEXT | ID del tipo de residuo (nullable si no aplica) |
| `waste_type_name` | TEXT | Nombre denormalizado para mostrar sin joins |
| `bin_type_id` | TEXT | ID del tipo de contenedor |
| `recycling_point_id` | TEXT | ID del punto de reciclaje |
| `recycling_point_name` | TEXT | Nombre denormalizado del punto |
| `detection_type` | TEXT | `'auto'` o `'manual'` |
| `confidence_score` | REAL | Score de confianza de la clasificacion IA (0-1) |
| `status` | TEXT DEFAULT `'confirmed'` | Estado del registro |
| `created_at` | TEXT NOT NULL | ISO 8601 timestamp de creacion |
| `synced` | INTEGER DEFAULT `0` | `0` = pendiente de subir, `1` = ya en Supabase |

**Flujo offline-first:**
1. Se inserta localmente con `synced = 0`.
2. Al detectar red, `syncPendingRecords()` sube cada registro con `upsert({ ignoreDuplicates: true })`.
3. Al sincronizar exitosamente, se actualiza `synced = 1`.

---

### `recycling_points`

Cache de puntos de reciclaje descargados de Supabase. Solo lectura desde la app; se sobreescribe completa en cada refresco.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | TEXT PK | UUID del punto en Supabase |
| `name` | TEXT NOT NULL | Nombre del punto |
| `latitude` | REAL NOT NULL | Latitud |
| `longitude` | REAL NOT NULL | Longitud |
| `available_bin_type_ids` | TEXT DEFAULT `'[]'` | JSON array de IDs de contenedores disponibles |
| `cached_at` | TEXT NOT NULL | ISO 8601 de cuando se guardo la cache |

**TTL:** 24 horas. Pasado ese tiempo `isRecyclingPointsCacheStale()` devuelve `true` y se refresca al reconectar.

**Fallback offline:** si la cache esta vencida pero hay datos, `getLocalRecyclingPointsStale()` los devuelve igual para no mostrar un mapa vacio.

---

### `fun_facts`

Cache de datos curiosos descargados de Supabase.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | TEXT PK | UUID del fun fact en Supabase |
| `text` | TEXT NOT NULL | Texto del dato curioso |
| `waste_type_id` | TEXT | Tipo de residuo al que aplica (nullable = generico) |
| `is_active` | INTEGER DEFAULT `1` | `1` activo, `0` inactivo |
| `created_at` | TEXT NOT NULL | Fecha de creacion en Supabase |
| `cached_at` | TEXT NOT NULL | ISO 8601 de cuando se guardo la cache |

**TTL:** 24 horas. Se refresca con `refreshFunFactsCache()` al reconectar.

---

### `instructions`

Cache de instrucciones de reciclaje (con sus pasos) descargadas de Supabase.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | TEXT PK | UUID de la instruccion en Supabase |
| `title` | TEXT NOT NULL | Titulo |
| `body` | TEXT | Descripcion larga (nullable) |
| `image_url` | TEXT | URL de imagen ilustrativa (nullable) |
| `waste_type_id` | TEXT | Tipo de residuo al que aplica |
| `is_active` | INTEGER DEFAULT `1` | `1` activo, `0` inactivo |
| `created_at` | TEXT NOT NULL | Fecha de creacion en Supabase |
| `updated_at` | TEXT | Fecha de ultima modificacion (nullable) |
| `steps_json` | TEXT DEFAULT `'[]'` | JSON array de `InstructionStep[]` serializado |
| `cached_at` | TEXT NOT NULL | ISO 8601 de cuando se guardo la cache |

Los pasos se almacenan serializados en `steps_json` para evitar una tabla adicional. Se deserializan al leer con `JSON.parse`.

**TTL:** 24 horas. Se refresca con `refreshInstructionsCache()` al reconectar.

---

## Archivos relevantes

| Archivo | Rol |
|---|---|
| [src/services/db/index.ts](../src/services/db/index.ts) | Singleton de la BD, crea las tablas |
| [src/services/local/recyclingRecords.ts](../src/services/local/recyclingRecords.ts) | CRUD de registros de reciclaje |
| [src/services/local/recyclingPoints.ts](../src/services/local/recyclingPoints.ts) | Cache de puntos de reciclaje |
| [src/services/local/content.ts](../src/services/local/content.ts) | Cache de fun facts e instrucciones |
| [src/services/sync/syncService.ts](../src/services/sync/syncService.ts) | Sube pendientes y refresca caches al reconectar |
| [src/hooks/useNetworkSync.ts](../src/hooks/useNetworkSync.ts) | Hook que dispara el sync al detectar red |

## TTL de caches

Todas las caches de contenido tienen un TTL de **24 horas**. El refresco se dispara automaticamente al reconectar a internet mediante `useNetworkSync` (montado en `AppGate`).