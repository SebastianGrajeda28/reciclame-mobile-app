# Ejecutar la App en Android

Esta guía cubre cómo levantar la app en un emulador Android o dispositivo físico.  
Antes de empezar, completa la configuración base en [INSTALACION_Y_CONFIGURACION.md](./INSTALACION_Y_CONFIGURACION.md).

---

## Requisitos

| Herramienta | Versión mínima |
|---|---|
| Android Studio | Ladybug (2024.2) o superior |
| JDK | 17 |
| Android SDK | API 35 |
| Build Tools | 35.0.0 |

---

## 1. Instalar Android Studio

Descarga desde [developer.android.com/studio](https://developer.android.com/studio).  
Durante la instalación, asegúrate de marcar:

- Android SDK
- Android SDK Platform
- Android Virtual Device (AVD)

---

## 2. Configurar el SDK en Android Studio

1. Abre Android Studio → **More Actions → SDK Manager**
2. En la pestaña **SDK Platforms**, instala:
   - **Android 15.0 (API 35)**
3. En la pestaña **SDK Tools**, instala:
   - **Android SDK Build-Tools 35**
   - **Android Emulator**
   - **Android SDK Platform-Tools**
4. Anota la ruta del SDK (esquina superior de SDK Manager, campo *Android SDK Location*)

---

## 3. Configurar variables de entorno

### Windows

Agrega estas variables al sistema (**Panel de control → Variables de entorno del sistema**):

| Variable | Valor |
|---|---|
| `ANDROID_HOME` | ruta del SDK, ej. `C:\Users\TuUsuario\AppData\Local\Android\Sdk` |
| `JAVA_HOME` | ruta del JDK 17, ej. `C:\Program Files\Java\jdk-17` |

Agrega también a `PATH`:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

Verifica en una terminal nueva:
```powershell
adb --version
```

### macOS / Linux

Agrega a `~/.zshrc` o `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk        # macOS
# export ANDROID_HOME=$HOME/Android/Sdk              # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

```bash
source ~/.zshrc   # o ~/.bashrc
adb --version
```

---

## 4. Crear un emulador (AVD)

1. Android Studio → **More Actions → Virtual Device Manager**
2. Clic en **Create Device**
3. Selecciona un dispositivo (ej. **Pixel 8**)
4. Descarga y selecciona la imagen del sistema: **API 35 (Android 15) — x86_64**
5. Finaliza y guarda el AVD

---

## 5. Iniciar el emulador

Desde Android Studio: clic en ▶ junto al AVD en Virtual Device Manager.

O desde consola:
```bash
emulator -avd <nombre_del_avd>
```

Verifica que el emulador está conectado:
```bash
adb devices
# Debe listar: emulator-5554  device
```

---

## 6. Ejecutar la app

Con el emulador corriendo (o dispositivo físico conectado por USB con depuración USB activada):

```bash
# Instala la app en el emulador y abre Metro
bun run android
```

La primera vez tarda varios minutos porque compila el código nativo.  
Después de la primera build, los cambios en JS se reflejan con recarga rápida.

---

## 7. Comandos útiles durante el desarrollo

```bash
# Iniciar solo Metro (si la app ya está instalada)
bun run start

# Limpiar caché de Metro
bun run start --clear

# Reinstalar la app desde cero
bun run android

# Ver logs del dispositivo
adb logcat

# Filtrar logs de la app
adb logcat -s ReactNative:V ReactNativeJS:V
```

Dentro de Expo Metro (terminal), shortcuts útiles:
- `a` — abrir en Android
- `r` — recargar
- `j` — abrir debugger
- `m` — toggle menú de desarrollo

---

## 8. Dispositivo físico (alternativa al emulador)

1. En tu Android: **Ajustes → Acerca del teléfono → toca "Número de compilación" 7 veces**
2. Ve a **Ajustes → Opciones de desarrollador → Activar depuración USB**
3. Conecta el cable USB y acepta el permiso en el dispositivo
4. Verifica conexión: `adb devices`
5. Ejecuta: `bun run android`

---

## 9. Solución de problemas

### `adb: command not found`
Verifica que `ANDROID_HOME/platform-tools` esté en el `PATH` y abre una terminal nueva.

### `JAVA_HOME is not set`
Instala JDK 17 y configura la variable `JAVA_HOME` (ver paso 3).

### `SDK location not found`
Crea el archivo `android/local.properties` con:
```
sdk.dir=C\:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk
```

### Error de Gradle en la primera build
```bash
cd android && ./gradlew clean && cd ..
bun run android
```

### La app se cuelga al cargar / pantalla en blanco
Workaround conocido:
1. Cierra la app **desde dentro del emulador** (botón atrás o recientes → swipe)
2. En la terminal de Metro, presiona `a` para reinstalar en Android
3. Repite 1-2 veces si sigue colgado — normalmente carga al segundo o tercer intento

Si persiste, prueba además:
```bash
adb reverse tcp:8081 tcp:8081
```
Luego vuelve a presionar `a` en Metro.

### Metro no conecta con el emulador
```bash
adb reverse tcp:8081 tcp:8081
```

---
