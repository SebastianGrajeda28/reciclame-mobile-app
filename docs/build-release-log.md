# Build Release Log — Android APK Fix

**Objetivo**: compilar `app-release.apk` con el parche `Container.native.js` incluido, corrigiendo el crash "Expected arraybuffer as first parameter" en builds release con Hermes.

---

## Contexto del problema

- **Error**: `Expected arraybuffer as first parameter` al montar cualquier componente `<Canvas>` de `@shopify/react-native-skia` en APK release.
- **Causa raíz**: `NativeReanimatedContainer` (usado cuando Reanimated 3 está presente) llama `Skia.Picture.MakePicture(null)` en su constructor. El binario nativo `librnskia.so` compilado no maneja `null` correctamente a través de Hermes JSI en builds release.
- **Parche aplicado**: `node_modules/@shopify/react-native-skia/lib/commonjs/sksg/Container.native.js` — reemplaza la llamada problemática por un `PictureRecorder` que crea una imagen vacía válida.
- **Script postinstall**: `scripts/patch-skia.mjs` re-aplica el parche tras cada `bun install`.

---

## Archivos modificados en sesiones anteriores

| Archivo | Cambio |
|---|---|
| `node_modules/@shopify/react-native-skia/lib/commonjs/sksg/Container.native.js` | Reemplaza `MakePicture(null)` por PictureRecorder |
| `scripts/patch-skia.mjs` | Script postinstall que re-aplica el parche |
| `package.json` (root) | Agrega `"postinstall": "node scripts/patch-skia.mjs"` |
| `apps/mobile/src/avatar/AvatarErrorBoundary.tsx` | Error boundary para capturar crashes del Canvas |
| `apps/mobile/src/features/profile/screens/ProfileAvatarScreen.tsx` | Envuelve AvatarComposer con AvatarErrorBoundary |
| `apps/mobile/src/features/profile/components/ProfileHeroCard.tsx` | Envuelve AvatarComposer con AvatarErrorBoundary |
| `apps/mobile/src/features/friends/screens/FriendsScreen.tsx` | Importa AvatarErrorBoundary |

---

## Sesión actual — 2026-07-02

### Problema previo bloqueante
`./gradlew clean assembleRelease` fallaba con **CMake GLOB mismatch** — los archivos fingerprint en `.cxx/` están corruptos (probablemente por un apagón abrupto previo, problema conocido en este proyecto).

### Plan de acción
1. Borrar `.cxx/` manualmente
2. Limpiar caché Metro
3. Ejecutar `./gradlew assembleRelease` (sin `clean`)
4. Corregir errores que surjan
5. Instalar y verificar en dispositivo

---

## Acciones ejecutadas

### Intento 1 — FALLIDO (Gradle lock conflict)
- **Acción**: `./gradlew assembleRelease` tras borrar `.cxx` y caché Metro
- **Error**: `Timeout waiting to lock file hash cache (.gradle/8.14.3/fileHashes)` — PID 29452 tenía el lock
- **Causa**: dos instancias de Gradle corriendo simultáneamente
- **Fix**: `./gradlew --stop` + `Stop-Process java` en PowerShell + borrar `fileHashes.lock` manualmente

### Intento 2 — BUILD SUCCESSFUL ✅
- **Fecha**: 2026-07-02
- **Duración**: 24m 18s
- **Tasks**: 814 total, 190 ejecutadas, 624 up-to-date
- **APK generado**: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- **Tamaño APK**: **199 MB** (>190 MB ✅)
- **Parche incluido**: `Container.native.js` con PictureRecorder en lugar de `MakePicture(null)`
