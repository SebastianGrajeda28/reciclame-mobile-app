# Android Release Build — Fixes Applied

Historial de los cambios necesarios para que `cd apps/mobile/android && ./gradlew assembleRelease` produzca un APK funcional en este monorepo.

**APK resultante:** `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` (~198 MB)

---

## Contexto del proyecto

| Aspecto | Detalle |
|---|---|
| Estructura | Monorepo Bun con `apps/mobile` (Expo 54 + RN 0.81.5) |
| Package manager | Bun con `nodeLinker = "hoisted"` (todos los paquetes en `/node_modules` raíz) |
| JS engine | Hermes |
| Arquitectura | New Architecture habilitada |

---

## Fix 1 — expo-file-system: versión del artifact Maven incorrecta

**Error:**
```
Could not resolve host.exp.exponent:expo.modules.filesystem:19.0.22
```

**Causa:** El `package.json` de `expo-file-system` declaraba la versión `19.0.22`, pero el artifact Maven local incluido dentro del paquete (`local-maven-repo/`) era `19.0.23`. Gradle no encontraba el artifact.

**Solución:** Se duplicó el directorio `19.0.23` dentro de `node_modules/expo-file-system/local-maven-repo/host/exp/exponent/expo.modules.filesystem/` y se renombró como `19.0.22`. Se corrigieron las referencias de versión dentro del `.pom` y `.module` de esa copia.

---

## Fix 2 — hermes-parser demasiado antiguo

**Error:**
```
SyntaxError: Unexpected token at VirtualView.js — match (mode) {
```

**Causa:** React Native 0.81.5 usa sintaxis de pattern matching de Hermes (`match (mode) { ... }`) en archivos internos. La versión `0.25.1` de `hermes-parser` (instalada como dependencia transitiva) no reconoce esa sintaxis.

**Solución:** Se agregó un override permanente en el `package.json` raíz del monorepo:

```json
// package.json (raíz del monorepo)
{
  "overrides": {
    "hermes-parser": "0.29.1"
  },
  "pnpm": {
    "overrides": {
      "hermes-parser": "0.29.1"
    }
  }
}
```

Luego se ejecutó `bun install` para aplicar el override.

---

## Fix 3 — @react-native-community/netinfo no enlazado nativamente

**Error en runtime:**
```
Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'RNCNetInfo' could not be found
```

**Causa:** El hook `useNetworkSync` importa `@react-native-community/netinfo`, pero el paquete estaba declarado **solo** en el `package.json` raíz del monorepo, no en `apps/mobile/package.json`. El sistema de autolinking de Expo (`expo-modules-autolinking`) escanea las dependencias del `package.json` de la aplicación móvil; los paquetes declarados únicamente en el monorepo raíz quedan fuera de esa detección. El `PackageList.java` generado automáticamente nunca incluía `NetInfoPackage`.

**Solución:** Agregar el paquete a `apps/mobile/package.json`:

```json
// apps/mobile/package.json
{
  "dependencies": {
    "@react-native-community/netinfo": "^12.0.1"
  }
}
```

Con esto, el autolinking lo detecta en la siguiente compilación, lo incluye en `PackageList.java` y Gradle lo enlaza como proyecto nativo automáticamente.

> **Regla general:** Todo paquete con código nativo Android debe estar declarado en `apps/mobile/package.json`, independientemente de si también está en el `package.json` raíz.

---

## Fix 4 — model.tflite inexistente

**Error:**
```
Unable to resolve module ../../../../../../assets/model/model.tflite
```

**Causa:** El clasificador on-device (`on-device-waste-classifier.ts`) hace un `require()` estático del modelo TFLite. Metro necesita que el archivo exista en disco al momento de empaquetar para resolver la referencia.

**Solución:** Se creó un placeholder en `apps/mobile/assets/model/model.tflite` con los magic bytes del formato TFLite (24 bytes). Metro puede así resolver la referencia.

> **Nota:** Este placeholder es solo para que el build no falle. Para que la clasificación on-device funcione realmente en producción, hay que reemplazar este archivo con el modelo TFLite real.

---

## Fix 5 — Múltiples instancias de React en el bundle

**Error en runtime:**
```
TypeError: Cannot read property 'useState' of null
TypeError: Cannot read property 'useMemoCache' of null
```

**Causa:** Los paquetes orientados a web (`@radix-ui/*`, `@dnd-kit/*`, `@floating-ui/*`, `react-router`, etc.) incluyen sus propias copias anidadas de React (~69 instalaciones en total). Metro las empaquetaba como módulos independientes. El renderer de React Native inicializa el dispatcher de hooks en **su** instancia de React, pero los providers de la app (`AuthProvider`, etc.) importaban `useState` desde **otra** instancia distinta → la propiedad resultaba `null`.

El intento previo con `extraNodeModules` no era suficiente: esa opción no aplica cuando la resolución ocurre desde dentro de `node_modules/`.

**Solución:** Se reemplazó `extraNodeModules` por `resolver.resolveRequest` en `metro.config.js`, que intercepta **toda** resolución de módulo sin importar desde qué directorio se origine:

```js
// apps/mobile/metro.config.js
const singletonModules = {
  react: path.resolve(workspaceRoot, 'node_modules/react/index.js'),
  'react/jsx-runtime': path.resolve(workspaceRoot, 'node_modules/react/jsx-runtime.js'),
  'react/jsx-dev-runtime': path.resolve(workspaceRoot, 'node_modules/react/jsx-dev-runtime.js'),
  'react/compiler-runtime': path.resolve(workspaceRoot, 'node_modules/react/compiler-runtime.js'),
  'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom/index.js'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native/index.js'),
  'react-native-renderer': path.resolve(workspaceRoot, 'node_modules/react-native-renderer/index.js'),
  scheduler: path.resolve(workspaceRoot, 'node_modules/scheduler/index.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (Object.prototype.hasOwnProperty.call(singletonModules, moduleName)) {
    return { type: 'sourceFile', filePath: singletonModules[moduleName] };
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

Adicionalmente, se deshabilitó el **React Compiler** en `babel.config.js` porque inserta llamadas a `react/compiler-runtime` que presentan el mismo problema de instancias múltiples:

```js
// apps/mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { 'react-compiler': false }]],
  };
};
```

---

## Fix 6 — Metro resuelve `./index.js` desde la raíz del monorepo en lugar de `apps/mobile`

**Error:**
```
Error: Unable to resolve module ./index.js from E:\a/.:
None of these files exist:
  * ..\..\index.js(.android.ts|.native.ts|.ts|...)
  * ..\..\index.js
> Task :app:createBundleReleaseJsAndAssets FAILED
```

**Causa:** `@expo/metro-config` setea `server.unstable_serverRoot` al resultado de `getMetroServerRoot(projectRoot)`, que en un monorepo devuelve la raíz del workspace (`E:\a`) en lugar de `apps/mobile`. Gradle pasa `--entry-file index.js` (relativo). Metro convierte ese path a `./index.js` y lo resuelve relativo a `unstable_serverRoot = E:\a`, buscando `E:\a\index.js`, que no existe.

**Solución:** Sobreescribir `unstable_serverRoot` en `apps/mobile/metro.config.js` para apuntar al `projectRoot` real (`apps/mobile`):

```js
// apps/mobile/metro.config.js
config.server = {
  ...config.server,
  unstable_serverRoot: projectRoot,
};
```

Con esto, Metro resuelve `./index.js` relativo a `apps/mobile/index.js`, que sí existe y contiene `import 'expo-router/entry'`.

> **Nota:** `unstable_serverRoot = workspaceRoot` lo setea Expo para soporte de proyectos web en monorepo. Al sobrescribirlo a `projectRoot` para builds Android no se pierde funcionalidad relevante para mobile.

---

## Resultado final

| Métrica | Valor |
|---|---|
| APK | `app-release.apk`, **~198 MB** |
| Crashes FATAL | **0** |
| NetInfo | `[NET] Conectividad: isConnected=true, type=wifi` ✓ |
| DB local (SQLite) | Tablas creadas, operativa ✓ |
| Auth + Supabase | Restauración de sesión y listeners funcionando ✓ |
| Sync + cachés | Se refrescan al detectar conexión ✓ |

---

## Comando de build

```bash
cd apps/mobile/android
./gradlew assembleRelease
```

El APK queda en:
```
apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

## Comando de prueba en emulador

```bash
adb install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk
adb logcat -c
adb shell am start -n com.anonymous.reciclamemobileapp/.MainActivity
sleep 8
adb logcat -d | grep -E "(FATAL|AndroidRuntime|ReactNativeJS|com.anonymous)" | tail -80
```
