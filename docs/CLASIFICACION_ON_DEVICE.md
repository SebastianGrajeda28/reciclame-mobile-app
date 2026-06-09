# Clasificación on-device (TFLite)

Inferencia de residuos en el celular usando `assets/model/model.tflite` (10 clases). Sin backend.

---

## Quickstart — primera vez (o máquina nueva)

```powershell
cd "D:\Dev\15. DP2-Reciclame\reciclame-mobile-app"

# 1. Instalar deps nativas (Expo elige versiones compatibles con el SDK)
bunx expo install expo-image-manipulator react-native-fast-tflite jpeg-js

# 2. Generar dev build y correr (una sola vez por máquina)
bunx expo prebuild
bunx expo run:android       # cel por USB  ← recomendado
# o con emulador AVD abierto en Android Studio:
# bunx expo run:android --device emulator

# 3. Aplicar migración de las 10 categorías
bun run db:reset
```

A partir del paso 2 abrís la app **reciclame-mobile-app** instalada (NO Expo Go). Hot reload sigue igual; solo recompilás si agregás otro módulo nativo.

> iOS requiere Mac + `bunx expo run:ios`. Pendiente para el release final.

---

## Quickstart — ya configurado (dev loop diario)

```powershell
cd "D:\Dev\15. DP2-Reciclame\reciclame-mobile-app"

# Levantar Supabase local (si no está corriendo)
bun run db:start

# Levantar bundler Metro
bun run start
```

Abrís la app instalada en el cel/emulador y hacés shake → Reload, o `r` en la terminal.

**Probar en emulador sin cel:**
1. Abrir Android Studio → Virtual Device Manager → Play en el AVD
2. `bunx expo run:android` (primera vez) o `bun run start` si ya está instalada la app

---

## Las 10 categorías

| ID | name (BD) | categoryId (app) | clase modelo | bin type |
|---|---|---|---|---|
| 001 | Carton | `cardboard` | Cartón | Papel y cartón |
| 002 | Botella plastica | `plastic_bottle` | Botella plástica | Plásticos |
| 003 | No aprovechables | `non_recoverable` | Residuo general | No aprovechables |
| 004 | Vidrio | `glass` | Vidrio | Vidrio |
| 005 | Pilas | `battery` | Pilas | Pilas |
| 006 | RAEE | `electronic_waste` | RAEE | RAEE |
| 007 | Otros plasticos | `plastic` | Plástico | Plásticos |
| 008 | Metal | `metal` | Metal | RAEE |
| 009 | Papel | `paper` | Papel | Papel y cartón |
| 010 | Organico | `organic` | Orgánico | No aprovechables |

Mapeo modelo→ID en [on-device-labels.ts](../src/features/recycling/services/classification/providers/on-device-labels.ts). Si cambia el modelo, hay que reordenar este archivo + `labels.json` en lockstep.

---

## Archivos creados / modificados

**Nuevos**
- `metro.config.js` — registra `.tflite` como assetExt
- `supabase/migrations/20260603220000_align_waste_types_with_model.sql` — agrega Carton, Metal, Organico, Plastico y renombra 001 y 002
- `src/features/recycling/services/classification/providers/on-device-waste-classifier.ts` — pipeline real
- `src/features/recycling/services/classification/providers/on-device-postprocess.ts` — argmax + mapeo (pura, testeable)
- `src/features/recycling/services/classification/providers/on-device-labels.ts` — tabla modelLabel→wasteTypeId
- `tests/components/onDeviceClassifier.test.tsx` — tests del mapeo

**Modificados**
- `app.json` — plugin `react-native-fast-tflite`
- `src/features/recycling/services/classification/index.ts` — usa `onDeviceWasteClassifier` cuando `RECYCLE_USE_MOCKS = false`
- `src/features/recycling/types/recycling.types.ts` — `WasteCategoryId` ahora son 10
- `src/features/recycling/services/waste-types.mock.ts` — 10 entradas
- `src/features/recycling/services/waste-category-config.mock.ts` — colores para las 10
- `src/features/recycling/screens/ProcessingScreen.tsx`, `src/features/map/screens/MapScreen.tsx`, `src/features/map/screens/RecycleFlowMapScreen.tsx`, `src/features/map/components/ContainerSelectedCard.tsx` — íconos para las 10
- `src/features/map/screens/MapScreen.tsx` — `FILTERS` extendido a 10 (validar UX si es mucho)

`package.json` **no se tocó** — las deps las pone `bunx expo install`.

---

## Pipeline (replica la app de referencia 1:1)

1. Resize a 224×224 con `expo-image-manipulator` (JPEG calidad 0.95).
2. Decode JPEG → RGBA con `jpeg-js`.
3. RGBA → RGB en `Uint8Array(224·224·3)`. **No normalizar** (el modelo lo hace internamente).
4. `model.run([rgb])` → `Float32Array` de 10 probabilidades.
5. Argmax + `confidence = round(prob, 2)` + mapeo a `wasteTypeId`.

El umbral de "Desconocido" se aplica fuera, vía `RECYCLE_CONFIDENCE_THRESHOLD` en [config.ts](../src/features/recycling/services/config.ts) (hoy `0.8`).

---

## Troubleshooting

| Síntoma | Causa | Fix |
|---|---|---|
| `Cannot find native module 'Tflite'` | Estás en Expo Go | Abrir la app `reciclame-mobile-app` instalada |
| `Unable to resolve module @/assets/model/model.tflite` | Metro no reconoce `.tflite` | Verificar `metro.config.js`; `bun run start --clear` |
| Predicciones constantes | Input dtype incorrecto (model espera float32) | Inspeccionar con `model.inputs[0].dataType`; si dice `float32`, normalizar `/ 255` en el pipeline |
| TS: `Cannot find module 'expo-image-manipulator' / 'jpeg-js' / 'react-native-fast-tflite'` | Faltó paso 1 | Correr `bunx expo install ...` y reiniciar TS server |

---

## Pendiente

- iOS build para release final (requiere Mac)
- Validar UX del filtro con 10 categorías en `MapScreen` (puede ser mucho scroll horizontal)
- Producto: revisar si `RECYCLE_CONFIDENCE_THRESHOLD = 0.8` está bien (brief original menciona 0.75)
