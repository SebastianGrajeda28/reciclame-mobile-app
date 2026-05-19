# Guía de Configuración - Reciclame Mobile App

Esta guía te ayudará a configurar el entorno de desarrollo para trabajar con **Reciclame Mobile App**.

---

## Requisitos Previos

- Git instalado
- Node.js V22.22.0
- Bun instalado

---

## Pasos de Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/reciclame-mobile-app.git
cd reciclame-mobile-app
```

### 2. Cambiar a la Rama Develop

```bash
git switch develop
```

### 3. Verificar Node.js

Verifica que tengas Node.js instalado:

```bash
node --version
```

Debería mostrar version v22.22.0.

---

## 4. Instalar Bun (Recomendado)

Bun es un runtime JavaScript más rápido que Node.js. Es **opcional pero muy recomendado**.

### Instalación de Bun

#### En Windows

```powershell
powershell -c "curl https://bun.sh/install.ps1|iex"
```

#### En macOS/Linux

```bash
curl -fsSL https://bun.sh/install | bash
```

### Verificar que Bun está instalado

```bash
bun --version
```

Debería mostrar `bun v22.22.0` o superior.

---

## 5. Instalar Dependencias

Una vez verificado Node.js y Bun, instala las dependencias:

### Con Bun (recomendado)

```bash
bun install
```

Esto descargará todos los paquetes necesarios.

---

## 6. Verificar la Configuración

### 6.1 Revisar archivo `setups.test.ts`

Abre el archivo `setups.test.ts` en tu editor:

```bash
cat setups.test.ts
```

Si ves errores del tipo:

```
No se encuentra el nombre "describe". ¿Necesita instalar definiciones de tipo para un test runner?
```

#### Solución: Actualizar `tsconfig.json`

Abre `tsconfig.json` y asegúrate de que tenga esta línea en `compilerOptions`:

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "types": ["jest"], // ← Agrega esta línea
    "paths": {
      "@/*": ["./*"],
    },
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
}
```

Guarda los cambios.

### 6.2 Ejecutar Tests

Verifica que todo esté configurado ejecutando los tests:

```bash
bun test
```

Deberías ver algo como:

```
✓ Entorno de Desarrollo - Reciclame
✓ Debería confirmar que Jest y TypeScript están configurados
```

---

## 7. Ejecutar la Aplicación

### Iniciar Expo

```bash
bun run start
```

Verás algo como:

```
Starting Expo server...
LAN: exp://192.168.x.x:8081
Local: exp://127.0.0.1:8081
Web: http://localhost:19006
```

---

## 8. Ver la App en Web

Para ver la app en el navegador:

1. **Presiona `w`** en la terminal donde está corriendo Expo
2. Se abrirá automáticamente en `http://localhost:19006`
3. La app se recargará automáticamente al hacer cambios en el código

```
› Press w › open web
```

---

## 9. Ver la App en tu Celular

### Requisitos

- Tu celular y computadora deben estar en **la misma red Wi-Fi**
- Descargar la app **Expo Go** desde:
  - **iOS**: App Store
  - **Android**: Google Play Store

### Pasos

1. En la terminal donde corre Expo, presiona:

   ```
   › Press q › show QR code
   ```

2. **Opción A - Código QR**
   - Se mostrará un código QR en la terminal
   - Abre **Expo Go** en tu celular
   - Toca el botón `Scan QR Code`
   - Escanea el código QR que aparece en tu terminal

3. **¡Listo!** La app se abrirá en tu celular y verás los cambios en tiempo real

---

## 10. Comandos Útiles

```bash
# Instalar dependencias
bun install

# Ejecutar tests
bun test

# Ejecutar tests en modo watch
bun test --watch

# Iniciar la app
bun run start

# Lint del código
bun run lint

# Hacer un commit (se validarán automáticamente)
git add .
git commit -m "feat: descripción de tu cambio"
```

---

## 11. Git Hooks Automáticos

El proyecto tiene **Husky** configurado, que ejecuta automáticamente:

1. **Pre-commit**: Valida que el nombre de la rama sea correcto
   - Formatos permitidos: `feature/`, `fix/`, `docs/`, `refactor/`
   - Ejemplo: `feature/home-screen`

2. **Commit-msg**: Valida el mensaje del commit
   - Sigue el formato: `type(scope): mensaje`
   - Ejemplo: `feat(home): agregar pantalla de inicio`

3. **Pre-push**: Ejecuta los tests antes de hacer push

---

## 12. Solución de Problemas

### Error: "command not found: bun"

```bash
# Reinstala Bun
curl -fsSL https://bun.sh/install | bash
# Recarga tu terminal
```

### Error: "describe is not defined"

Asegúrate de que agregaste `"types": ["jest"]` en `tsconfig.json` (ver paso ✅ Verificar la Configuración)

### La app no se abre en el celular

- Verifica que estén en la **misma red Wi-Fi**
- Prueba desinstalar y reinstalar **Expo Go**
- Verifica que el puerto 8081 esté disponible

---

## 13. Soporte

Si tienes problemas, abre un **Issue** en el repositorio con:

- Error exacto
- Pasos para reproducirlo
- Versiones de Node.js, Bun, y Expo

---
