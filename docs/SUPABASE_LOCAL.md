# Guía: Base de datos local con Supabase + Docker

Esta guía explica cómo levantar una base de datos Supabase en tu máquina para desarrollo local.

> **Nota:** Este setup es **solo para desarrollo local**. La app usará Supabase Cloud en producción.

---

## Archivos de variables de entorno

El proyecto tiene **dos archivos `.env`** con propósitos distintos:

| Archivo | Para qué sirve |
|---|---|
| `.env.local` (raíz del proyecto) | Variables que usa la app Expo: URL y anon key de Supabase |
| `docker/.env.local` | Variables internas de Docker/Postgres: usuario y contraseña de la BD |

> Nunca mezcles variables de un archivo en el otro.

---

## ¿Qué necesitas?

- Tener el repo clonado e instalado (ver [INSTALACION_Y_CONFIGURACION.md](./INSTALACION_Y_CONFIGURACION.md))
- Docker Desktop instalado y corriendo

---

## Paso 1 — Verificar si tienes Docker

Abre una terminal y ejecuta:

```bash
docker --version
```

Si ves algo como `Docker version 27.x.x` → ya lo tienes, pasa al [Paso 3](#paso-3--verificar-que-docker-está-corriendo).

Si ves `command not found` o un error → sigue el Paso 2.

---

## Paso 2 — Instalar Docker (si no lo tienes)

### Windows

1. Descarga **Docker Desktop** desde [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Ejecuta el instalador `.exe` y sigue los pasos (acepta los defaults)
3. Cuando termine, **reinicia tu computadora**
4. Abre **Docker Desktop** desde el menú inicio y espera a que el ícono de la ballena aparezca en la barra de tareas
5. Verifica en terminal:

```bash
docker --version
docker compose version
```

Ambos deben mostrar una versión sin errores.

### macOS

```bash
# Con Homebrew
brew install --cask docker
```

Luego abre Docker Desktop desde Aplicaciones y espera a que esté listo.

### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

---

## Paso 3 — Verificar que Docker está corriendo

Docker Desktop debe estar **abierto y en estado "Running"** (ícono de ballena verde en la barra de tareas).

Para verificar desde terminal:

```bash
docker ps
```

Si no hay errores, Docker está listo.

---

## Paso 4 — Verificar los archivos de entorno

### 4.1 — `docker/.env.local` (variables internas de Docker)

Este archivo ya viene en el proyecto con los valores correctos para desarrollo local. No necesitas cambiarlo.

Contenido esperado:

```
POSTGRES_DB=reciclame_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_local_dev_secure_123
```

> Solo modifica este archivo si necesitas cambiar la configuración interna de PostgreSQL. La app Expo **nunca** lee este archivo.

### 4.2 — `.env.local` (raíz del proyecto, variables de la app)

Este archivo usa la conexión a Supabase desde la app. Debe tener esta estructura:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<se llena en el Paso 6>
```

> Si el archivo no existe, créalo en la **raíz del proyecto** (no dentro de `docker/`) con ese contenido.

---

## Paso 5 — Levantar Supabase local

Este comando descarga las imágenes Docker de Supabase (solo la primera vez tarda, luego es rápido) y levanta todos los servicios:

**Con npm:**
```bash
npm run db:start
```

**Con bun:**
```bash
bun run db:start
```

Verás algo como:

```
[+] Pulling images...
Starting containers...
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
        anon key: eyJh...
service_role key: eyJh...
```

> En Windows puede aparecer un aviso sobre Analytics. Es inofensivo, ignóralo.

---

## Paso 6 — Copiar el anon key a `.env.local` (raíz)

Del output del paso anterior, copia el valor de **`anon key`** (empieza con `eyJh...`).

Abre `.env.local` en la **raíz del proyecto** (NO el de `docker/`) y pégalo:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...   ← pega aquí el anon key completo
```

> **Nunca copies el `service_role key`** en este archivo. Ese key tiene acceso total a la BD y nunca debe ir en la app móvil.

Si en algún momento necesitas ver las keys de nuevo:

**Con npm:**
```bash
npm run db:status
```

**Con bun:**
```bash
bun run db:status
```

---

## Paso 7 — Verificar la conexión con el test

Ejecuta el test de conexión para confirmar que todo está bien:

**Con npm:**
```bash
npm test
```

**Con bun:**
```bash
bun test
```

Si todo está correcto verás:

```
✓ Conexión a Supabase
  ✓ Debería conectarse y leer la tabla health_check
```

Si el test aparece como `skipped` significa que `.env.local` (raíz) no tiene las variables cargadas — revisa el Paso 6.

---

## Comandos del día a día

| Acción | npm | bun |
|---|---|---|
| Levantar Supabase | `npm run db:start` | `bun run db:start` |
| Apagar Supabase | `npm run db:stop` | `bun run db:stop` |
| Ver estado y keys | `npm run db:status` | `bun run db:status` |
| Aplicar migraciones | `npm run db:migrate` | `bun run db:migrate` |
| Resetear BD (borra todo) | `npm run db:reset` | `bun run db:reset` |
| Correr tests | `npm test` | `bun test` |

> **Recuerda apagar Supabase** cuando termines de trabajar (`db:stop`). Consume bastante RAM y CPU.

---

## Solución de problemas

### "Cannot connect to the Docker daemon"

Docker Desktop no está corriendo. Ábrelo desde el menú inicio y espera a que el ícono de la ballena esté verde.

### El test aparece como `skipped`

Las variables de entorno no se cargaron. Verifica que:
1. El archivo `.env.local` (raíz) existe y tiene el `EXPO_PUBLIC_SUPABASE_ANON_KEY` del Paso 6
2. No estás editando `docker/.env.local` por error — ese no lo lee la app
3. Supabase está corriendo (`npm run db:status` / `bun run db:status`)

### "supabase: command not found"

Falta instalar las dependencias del proyecto:

```bash
npm install   # o: bun install
```

### Puerto 54321 ya está en uso

Otro proceso está usando ese puerto. Intenta:

```bash
npm run db:stop   # o: bun run db:stop
npm run db:start  # o: bun run db:start
```

Si persiste, reinicia Docker Desktop.

### Error en Windows: "Analytics requires Docker daemon on tcp://localhost:2375"

Es una advertencia, no un error. No afecta el funcionamiento. Puedes ignorarla.

---
