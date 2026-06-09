# Backend — Reciclame Web

API REST del proyecto Reciclame. Construida con **Bun**, **Hono** y **Drizzle ORM** sobre **PostgreSQL** (Supabase).

---

## Tecnologías

| Herramienta | Versión | Rol |
|---|---|---|
| Bun | >= 1.0 | Runtime y gestor de paquetes |
| Hono | ^4.12 | Framework HTTP |
| Drizzle ORM | ^0.45 | ORM para PostgreSQL |
| postgres | ^3.4 | Driver PostgreSQL |
| @supabase/supabase-js | ^2.107 | Auth + Admin API |

---

## Requisitos previos

- Bun instalado (`https://bun.sh`)
- Proyecto Supabase activo con las tablas del esquema creadas
- Variables de entorno configuradas (ver sección siguiente)

---

## Variables de entorno

Crea un archivo `.env` en la raíz de `backend/` con las siguientes variables:

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión directa a PostgreSQL (Supabase → Settings → Database) |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave pública anon (Supabase → Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio con permisos admin (Supabase → Settings → API) |

> `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al cliente. Se usa exclusivamente en el backend para crear usuarios via la Admin API.
> Pedir las variables a  Vladymir.
---

## Instalación y ejecución

```sh
# Instalar dependencias
bun install

# Desarrollo con hot reload
bun run dev
```

El servidor escucha en `http://localhost:3000`.

---

## Estructura del proyecto

```
backend/
├── src/
│   ├── index.ts                          # Punto de entrada, registro de rutas
│   ├── db/
│   │   ├── index.ts                      # Conexión a la base de datos
│   │   └── schema.ts                     # Esquema Drizzle (tablas y tipos)
│   ├── middleware/
│   │   ├── auth.ts                       # Verifica JWT de Supabase y carga roles
│   │   └── roles.ts                      # Middleware requireRole()
│   └── modules/
│       ├── users/
│       │   └── routes.ts                 # /api/users
│       ├── user_roles/
│       │   └── routes.ts                 # /api/user-roles
│       ├── roles/
│       │   └── routes.ts                 # /api/roles
│       └── educational-content/
│           └── routes.ts                 # /api/educational-content
└── package.json
```

---

## Esquema de base de datos

### `users`
Espejo de `auth.users` de Supabase. Se sincroniza manualmente o via trigger.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Mismo UUID que `auth.users.id` |
| `email` | text UNIQUE | Correo del usuario |
| `is_active` | boolean | Eliminación lógica (default `true`) |
| `created_at` | timestamptz | Fecha de creación |
| `updated_at` | timestamptz | Última modificación |
| `last_login_at` | timestamptz | Último inicio de sesión |

### `roles`
Catálogo de roles del sistema. Los valores esperados son `ADMIN`, `MANAGER` y `VIEWER`.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `name` | text UNIQUE | Nombre del rol |
| `description` | text | Descripción opcional |
| `is_active` | boolean | Eliminación lógica |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `user_roles`
Tabla de asignación N:M entre usuarios y roles. Un usuario puede tener un rol activo a la vez (por convención de la aplicación).

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → users.id | |
| `role_id` | uuid FK → roles.id | |
| `is_active` | boolean | Eliminación lógica |
| `assigned_at` | timestamptz | Fecha de asignación |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `educational_content`
Contenido educativo sobre reciclaje.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `category` | text | Categoría del contenido |
| `title` | text | Título |
| `description` | text | Descripción corta |
| `content_type` | text | Tipo de contenido (artículo, video, etc.) |
| `body` | text | Contenido principal |
| `image_url` | text | URL de imagen opcional |
| `waste_type_id` | uuid | Referencia al tipo de residuo (tabla externa) |
| `is_active` | boolean | Eliminación lógica |
| `display_order` | integer | Orden de visualización (default 0) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

## Autenticación

Todas las rutas bajo `/api/*` (excepto `/api/health-db`) requieren un JWT válido emitido por Supabase Auth.

El token debe enviarse en el header:

```
Authorization: Bearer <access_token>
```

El middleware `auth.ts` valida el token con `supabase.auth.getUser()`, consulta los roles activos del usuario en `user_roles` y los inyecta como variable de contexto en cada request.

### Control de acceso por rol

El middleware `requireRole(...roles)` verifica que el usuario tenga al menos uno de los roles indicados. Si no, responde `403 Forbidden`.

---

## Endpoints

### General

#### `GET /api/health-db`
Verifica la conexión a la base de datos. No requiere autenticación.

**Respuesta exitosa:**
```json
{ "ok": true, "message": "Conexión a la BD exitosa" }
```

---

#### `GET /api/me`
Devuelve los datos del usuario autenticado. Requiere token válido.

**Respuesta:**
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "name": "Nombre Completo",
  "role": "ADMIN"
}
```

---

### Usuarios — `/api/users`

Todos los endpoints requieren rol `ADMIN`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Lista todos los usuarios. Parámetro `?includeInactive=true` para incluir inactivos |
| GET | `/api/users/:id` | Obtiene un usuario por ID |
| POST | `/api/users/provision` | Crea un empleado en Supabase Auth + `public.users` + asigna rol |
| POST | `/api/users` | Inserta directamente en `public.users` (sin crear en Auth) |
| PUT | `/api/users/:id` | Actualiza email o lastLoginAt |
| DELETE | `/api/users/:id` | Desactiva el usuario (eliminación lógica) |
| PATCH | `/api/users/:id/restore` | Reactiva un usuario desactivado |

#### `POST /api/users/provision`
Flujo completo de creación de empleado:
1. Crea el usuario en Supabase Auth con `service_role_key` (confirma el email automáticamente).
2. Inserta en `public.users` con el mismo UUID (usa `ON CONFLICT DO NOTHING` por si hay trigger).
3. Busca el rol por nombre en la tabla `roles` y lo asigna en `user_roles`.
4. Si el rol no existe, elimina el usuario recién creado en Auth y devuelve error.

**Body:**
```json
{
  "email": "empleado@empresa.com",
  "password": "contraseña_segura",
  "name": "Nombre Completo",
  "roleName": "MANAGER"
}
```

**Respuesta exitosa (201):**
```json
{ "message": "Usuario creado", "userId": "uuid" }
```

---

### Roles — `/api/roles`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/roles` | Lista los roles activos. Requiere rol `ADMIN` |

---

### Asignaciones de rol — `/api/user-roles`

Todos los endpoints requieren rol `ADMIN`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/user-roles` | Lista asignaciones. Parámetros: `?userId=uuid`, `?includeInactive=true` |
| GET | `/api/user-roles/:id` | Obtiene una asignación por ID |
| POST | `/api/user-roles` | Asigna un rol a un usuario |
| PUT | `/api/user-roles/:id` | Cambia el rol de una asignación |
| DELETE | `/api/user-roles/:id` | Desactiva la asignación (eliminación lógica) |
| PATCH | `/api/user-roles/:id/restore` | Reactiva una asignación desactivada |

**Body para POST:**
```json
{ "userId": "uuid", "roleId": "uuid" }
```

---

### Contenido educativo — `/api/educational-content`

| Método | Ruta | Auth requerida | Descripción |
|---|---|---|---|
| GET | `/api/educational-content` | No | Lista todo el contenido |
| GET | `/api/educational-content/:id` | No | Obtiene un item por ID |
| POST | `/api/educational-content` | ADMIN o EDITOR | Crea un item |
| PUT | `/api/educational-content/:id` | ADMIN o EDITOR | Actualiza un item |
| DELETE | `/api/educational-content/:id` | ADMIN | Elimina un item (físico) |

---

## Eliminación lógica

Las tablas `users` y `user_roles` usan eliminación lógica mediante el campo `is_active`. Los registros nunca se borran de la base de datos; se marcan como inactivos.

- `DELETE /api/users/:id` → `is_active = false`
- `PATCH /api/users/:id/restore` → `is_active = true`
- `DELETE /api/user-roles/:id` → `is_active = false`
- `PATCH /api/user-roles/:id/restore` → `is_active = true`

---

## CORS

El servidor acepta requests desde `http://localhost:5173` (frontend Vite en desarrollo) con soporte de credenciales.

Para producción, actualiza el array `origin` en `src/index.ts`.

---

## Notas de desarrollo

- El servidor usa `--hot` en desarrollo para recargar automáticamente al guardar cambios.
- Drizzle Kit está disponible como devDependency para gestionar migraciones (`bunx drizzle-kit`).
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el endpoint `/api/users/provision`. El cliente admin se inicializa con `autoRefreshToken: false` y `persistSession: false` para uso exclusivo del servidor.
