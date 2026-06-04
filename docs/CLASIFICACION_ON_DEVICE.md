# Clasificación on-device (TFLite)

Inferencia de residuos en el celular usando `assets/model/model.tflite` (10 clases). Sin backend.

---

## Cómo arrancarlo

```powershell
cd "D:\Dev\15. DP2-Reciclame\reciclame-mobile-app"

# 1. Instalar deps nuevas (Expo elige las versiones compatibles con el SDK)
bunx expo install expo-image-manipulator react-native-fast-tflite jpeg-js

# 2. Generar dev build (una sola vez — reemplaza Expo Go)
bunx expo prebuild
bunx expo run:android   # con cel USB o emulador AVD abierto

# 3. Aplicar migración de las 10 categorías
bun run db:reset

# 4. Activar el classifier real
# editar src/features/recycling/services/config.ts:
#   RECYCLE_USE_MOCKS = false

# 5. Levantar el bundler como siempre
bun run start
```

A partir del paso 2, abrís la app **reciclame-mobile-app** instalada (NO Expo Go). El dev loop de JS sigue igual: hot reload, QR, etc. Solo recompilás si agregás otro módulo nativo.

> Para iOS hace falta Mac + `bunx expo run:ios`. Pendiente para el release final.

---

## Las 10 categorías

| ID | name (BD) | categoryId (app) | clase modelo |
|---|---|---|---|
| 001 | Papel | `paper` | Papel |
| 002 | Botella plastica | `plastic_bottle` | Botella plástica |
| 003 | No aprovechables | `non_recoverable` | Residuo general |
| 004 | Vidrio | `glass` | Vidrio |
| 005 | Pilas | `battery` | Pilas |
| 006 | RAEE | `electronic_waste` | RAEE |
| 007 | Carton | `cardboard` | Cartón |
| 008 | Metal | `metal` | Metal |
| 009 | Organico | `organic` | Orgánico |
| 010 | Plastico | `plastic` | Plástico |

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
