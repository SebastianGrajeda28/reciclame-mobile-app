# Guía: Base de datos local con Supabase CLI

Esta guía explica cómo levantar una base de datos Supabase en tu máquina para desarrollo local.

> **Nota:** Este setup es **solo para desarrollo local**. La app usará Supabase Cloud en producción.

---

## Archivo de variables de entorno

Cada app tiene su propio `.env`. Variables mínimas para Supabase local:

**`apps/mobile/.env`**
```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<se llena en el Paso 5>
```

**`apps/admin-web/.env`**
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<se llena en el Paso 5>
```

Además, `supabase/config.toml` lee estas variables desde el entorno local para habilitar Google OAuth en Supabase CLI:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## ¿Qué necesitas?

- Repo clonado e instalado (`bun install` desde la raíz)
- Docker Desktop instalado y corriendo (el CLI de Supabase lo usa internamente)

---

## Paso 1 — Verificar si tienes Docker

```bash
docker --version
```

Si ves `Docker version 27.x.x` → ya lo tienes, pasa al [Paso 3](#paso-3--verificar-que-docker-está-corriendo).

Si ves `command not found` → sigue el Paso 2.

---

## Paso 2 — Instalar Docker (si no lo tienes)

### Windows

1. Descarga **Docker Desktop** desde https://www.docker.com/products/docker-desktop
2. Ejecuta el instalador `.exe` y sigue los pasos
3. Reinicia la computadora
4. Abre **Docker Desktop** y espera a que el ícono de la ballena aparezca en la barra de tareas

```bash
docker --version
docker compose version
```

### macOS

```bash
brew install --cask docker
```

Luego abre Docker Desktop desde Aplicaciones.

### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## Paso 3 — Verificar que Docker está corriendo

```bash
docker ps
```

Sin errores → Docker está listo.

---

## Paso 4 — Levantar Supabase local

```bash
bun run db:start
```

Primera vez tarda (descarga imágenes). Verás algo como:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
        anon key: eyJh...
service_role key: eyJh...
```

---

## Paso 5 — Copiar el anon key a `.env`

Copia el valor de **`anon key`** del output anterior y pégalo en el `.env` de cada app.

> **Nunca copies el `service_role key`** en archivos de la app. Ese key tiene acceso total a la BD.

Para ver las keys en cualquier momento:

```bash
bun run db:status
```

---

## Comandos del día a día

| Acción | Comando |
|---|---|
| Levantar Supabase | `bun run db:start` |
| Apagar Supabase | `bun run db:stop` |
| Ver estado y keys | `bun run db:status` |
| Aplicar migraciones | `bun run db:migrate` |
| Resetear BD (borra todo) | `bun run db:reset` |

> **Recuerda apagar Supabase** cuando termines (`db:stop`). Consume bastante RAM y CPU.

---

## Solución de problemas

### "Cannot connect to the Docker daemon"

Docker Desktop no está corriendo. Ábrelo y espera a que el ícono de la ballena esté verde.

### "supabase: command not found"

```bash
bun install
```

### Puerto 54321 ya está en uso

```bash
bun run db:stop
bun run db:start
```

Si persiste, reinicia Docker Desktop.

### Error en Windows: "Analytics requires Docker daemon on tcp://localhost:2375"

Es una advertencia, no un error. Ignórala.

---

## Conectarse a la BD con un cliente SQL

Supabase usa PostgreSQL. Clientes recomendados: pgAdmin 4, DBeaver, TablePlus.

**Datos de conexión** (con Supabase local corriendo):

```
Host:     localhost
Port:     54322
Database: postgres
User:     postgres
Password: postgres
```

El puerto es **54322**, no 5432. Supabase CLI usa ese puerto para no chocar con otras instalaciones de PostgreSQL.

---

## Migraciones

Las tablas **no se crean manualmente** — se crean mediante migraciones en `supabase/migrations/` o mediante los schemas declarativos en `supabase/schemas/`. Ver [database.md](./database.md) para el flujo completo.

Regla operativa:
- **leer y explorar datos** → pgAdmin / Supabase Studio
- **crear o modificar estructura** → `supabase/schemas/` + `bun run db:diff`
