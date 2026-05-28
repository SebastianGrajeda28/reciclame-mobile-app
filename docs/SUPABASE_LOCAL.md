# Guía: Base de datos local con Supabase CLI

Esta guía explica cómo levantar una base de datos Supabase en tu máquina para desarrollo local.

> **Nota:** Este setup es **solo para desarrollo local**. La app usará Supabase Cloud en producción.

---

## Archivo de variables de entorno

El proyecto tiene **un solo archivo `.env`** en la raíz del proyecto con las variables de la app:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<se llena en el Paso 5>
```

El login con Google no necesita variables adicionales en el archivo `.env`; usa estas mismas credenciales de Supabase. Lo que sí debes configurar fuera del repo es el provider de Google dentro de Supabase y sus redirect URLs.

Además, `supabase/config.toml` lee estas variables desde el entorno local para habilitar Google OAuth en Supabase CLI:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## ¿Qué necesitas?

- Tener el repo clonado e instalado (ver [INSTALACION_Y_CONFIGURACION.md](./INSTALACION_Y_CONFIGURACION.md))
- Docker Desktop instalado y corriendo (el CLI de Supabase lo usa internamente)

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

## Paso 4 — Levantar Supabase local

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

## Paso 5 — Copiar el anon key a `.env`

Del output del paso anterior, copia el valor de **`anon key`** (empieza con `eyJh...`).

Abre `.env` en la **raíz del proyecto** y pégalo:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...   ← pega aquí el anon key completo
```

> **Nunca copies el `service_role key`** en este archivo. Ese key tiene acceso total a la BD y nunca debe ir en la app móvil.

Si en algún momento necesitas ver las keys de nuevo:

```bash
npm run db:status   # o: bun run db:status
```

---

## Paso 6 — Verificar la conexión con el test

Ejecuta el test de conexión para confirmar que todo está bien:

```bash
npm test   # o: bun test
```

Si todo está correcto verás:

```
✓ Conexión a Supabase
  ✓ Debería conectarse y leer la tabla health_check
```

Si el test aparece como `skipped` significa que `.env` no tiene las variables cargadas — revisa el Paso 5.

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
1. El archivo `.env` existe en la raíz del proyecto
2. Tiene el `EXPO_PUBLIC_SUPABASE_ANON_KEY` del Paso 5
3. Supabase está corriendo (`npm run db:status`)

### "supabase: command not found"

Falta instalar las dependencias del proyecto:

```bash
npm install   # o: bun install
```

### Puerto 54321 ya está en uso

Otro proceso está usando ese puerto. Intenta:

```bash
npm run db:stop
npm run db:start
```

Si persiste, reinicia Docker Desktop.

### Error en Windows: "Analytics requires Docker daemon on tcp://localhost:2375"

Es una advertencia, no un error. No afecta el funcionamiento. Puedes ignorarla.

---

## Por qué se eliminó el `docker-compose.yml`

Al inicio del proyecto se creó un archivo `docker/docker-compose.yml` que levantaba PostgreSQL directamente con Docker. El error fue pensar que ese archivo era suficiente para el desarrollo local.

**El problema:** ese setup solo levantaba PostgreSQL puro en el puerto `5432`, pero la app usa `@supabase/supabase-js` que se conecta a través de la **API REST de Supabase** (`http://localhost:54321`), no directamente a PostgreSQL. Sin la API, Auth y el resto del stack, la app no puede funcionar.

**La confusión con los archivos `.env`:** se tenía `docker/.env.local` para las credenciales de PostgreSQL y `.env` en la raíz para la app. Esto generaba confusión porque eran dos archivos con propósitos distintos y era fácil editar el equivocado.

**La decisión:** eliminar el `docker-compose.yml` y usar únicamente el CLI de Supabase (`npm run db:start`), que levanta el stack completo en un solo comando: PostgreSQL, API REST, Auth y Storage. La BD siempre se llama `postgres` y corre en el puerto `54322`.

---

## Conectarse a la BD con un cliente SQL (pgAdmin, DBeaver, TablePlus)

Supabase usa PostgreSQL, así que puedes conectarte con cualquier cliente SQL compatible. No puedes usar MySQL Workbench porque ese es exclusivo de MySQL.

**Clientes recomendados:**

| Herramienta | Sistema | Precio |
|---|---|---|
| **pgAdmin 4** | Windows / Mac / Linux | Gratis |
| **DBeaver** | Windows / Mac / Linux | Gratis |
| **TablePlus** | Windows / Mac | Gratis (limitado) |

**Datos de conexión** (con Supabase local corriendo):

```
Host:     localhost
Port:     54322          ← puerto PostgreSQL del CLI de Supabase
Database: postgres
User:     postgres
Password: postgres
```

> El puerto es **54322**, no 5432. Supabase CLI usa ese puerto para no chocar con otras instalaciones de PostgreSQL.

Desde el cliente puedes explorar tus tablas, hacer queries, insertar datos de prueba y verificar relaciones — igual que en MySQL Workbench.

---

## Crear tablas y relaciones

Las tablas **no se crean desde el cliente SQL ni manualmente** — se crean mediante archivos de migración en `supabase/migrations/`. Esto asegura que todos en el equipo tengan exactamente el mismo esquema.

### Crear una migración nueva

1. Crea un archivo `.sql` en `supabase/migrations/` con el formato `YYYYMMDDHHMMSS_descripcion.sql`:

```
supabase/migrations/20260519000001_crear_tablas.sql
```

> El timestamp debe ser mayor al del último archivo existente en esa carpeta.

2. Escribe el SQL dentro:

```sql
-- Tabla simple
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- Tabla con relación (foreign key)
create table if not exists public.recycling_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  tipo_residuo text not null,
  timestamp timestamptz not null default now()
);
```

3. Aplica la migración:

```bash
npm run db:reset   # borra todo y aplica todas las migraciones en orden
```

### Tipos de datos más usados en PostgreSQL

| Tipo | Uso |
|---|---|
| `uuid` | IDs únicos (recomendado sobre integer) |
| `text` | Texto sin límite de caracteres |
| `numeric` | Números decimales (ej: coordenadas) |
| `boolean` | Verdadero / falso |
| `timestamptz` | Fecha y hora con zona horaria |
| `text[]` | Array de texto |

### Relaciones entre tablas

```sql
-- Uno a muchos: un usuario tiene muchos logs
user_id uuid not null references public.usuarios(id) on delete cascade

-- Muchos a muchos: tabla intermedia con clave compuesta
create table if not exists public.container_waste_types (
  container_id uuid not null references public.recycling_containers(id) on delete cascade,
  waste_type_id uuid not null references public.waste_types(id) on delete cascade,
  primary key (container_id, waste_type_id)
);
```

**`on delete cascade`** significa que si borras un usuario, todos sus logs se borran automáticamente. Úsalo cuando los registros hijos no tienen sentido sin el padre.

### Regla importante

Nunca edites un archivo de migración que ya fue aplicado. Si necesitas cambiar algo, crea una **nueva migración** con un timestamp mayor.

---

## ¿Qué es el timestamp en las migraciones?

Es la fecha y hora en formato `YYYYMMDDHHMMSS`. Por ejemplo:

```
20260519000001_crear_tablas.sql
│
└─ 2026-05-19 a las 00:00:01
```

**¿Por qué se usa?** Porque Supabase necesita saber en qué **orden** aplicar las migraciones. Si tienes una tabla `recycling_logs` que referencia a `usuarios`, primero debe existir `usuarios`. El timestamp garantiza ese orden — siempre se aplican de menor a mayor.

Sin timestamp, si dos personas del equipo crean migraciones el mismo día, no habría forma de saber cuál va primero.

---

## ¿Puedo crear tablas desde pgAdmin?

Sí puedes, pero **no deberías** en este proyecto. El problema es que:

- Los cambios que hagas en pgAdmin **no quedan registrados** en ningún archivo del proyecto
- Cuando otro del equipo corra `npm run db:reset`, su BD no tendrá esas tablas
- Cuando vayas a producción, esas tablas tampoco existirán

pgAdmin es útil para **consultar datos, hacer queries de prueba e inspeccionar tablas** — pero para crear la estructura de la BD siempre usa migraciones en `supabase/migrations/`.

> Regla simple: **leer y explorar** → pgAdmin. **Crear o modificar estructura** → archivo `.sql` de migración.

---
