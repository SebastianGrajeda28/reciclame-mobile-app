# Frontend — Reciclame

Aplicación web del proyecto Reciclame. Construida con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS v4**.

---

## Tecnologías

| Herramienta | Versión | Rol |
|---|---|---|
| React | ^19.2 | Framework de UI |
| TypeScript | ~6.0 | Tipado estático |
| Vite | ^8.0 | Bundler y servidor de desarrollo |
| Tailwind CSS | ^4.3 | Estilos utilitarios |
| React Router DOM | ^7.17 | Enrutamiento |
| @supabase/supabase-js | ^2.107 | Auth del lado del cliente |
| React Hook Form | ^7.77 | Manejo de formularios |
| Zod | ^4.4 | Validación de esquemas |
| TanStack React Query | ^5.101 | Fetching y caché de datos |
| Sonner | ^2.0 | Notificaciones toast |
| Lucide React | ^1.17 | Iconos |
| Radix UI | varios | Componentes accesibles base |

---

## Requisitos previos

- Bun instalado (`https://bun.sh`)
- Backend corriendo en `http://localhost:3000`
- Proyecto Supabase activo

---

## Variables de entorno

Crea un archivo `.env` en la raíz de `frontend/` con las siguientes variables:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_BACKEND_URL_MEDIA=http://localhost:3000
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=...
```

| Variable | Descripción |
|---|---|
| `VITE_BACKEND_URL` | URL base del backend para llamadas a la API |
| `VITE_BACKEND_URL_MEDIA` | URL base para archivos multimedia (videos, imágenes) |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |

---

## Instalación y ejecución

```sh
# Instalar dependencias
bun install

# Servidor de desarrollo (http://localhost:5173)
bun run dev

# Build de producción
bun run build

# Vista previa del build
bun run preview

# Linter
bun run lint
```

---

## Estructura del proyecto

```
frontend/src/
├── App.tsx                             # Raíz de la app: router, providers y rutas
├── main.tsx                            # Punto de entrada React
├── lib/
│   └── supabase.ts                     # Cliente Supabase (anon key)
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx          # Guardia de rutas por rol
│   └── ui/                             # Componentes Radix/shadcn generados
│       ├── button.tsx
│       ├── input.tsx
│       ├── table.tsx
│       ├── badge.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── alert-dialog.tsx
│       └── ...
├── shared/
│   ├── context/
│   │   └── UserContext.tsx             # Contexto global de sesión y cuenta
│   ├── components/
│   │   ├── Header.tsx                  # Cabecera fija con logo y navbar
│   │   ├── RoleNavbar.tsx              # Navegación adaptada al rol del usuario
│   │   ├── Footer.tsx                  # Pie de página
│   │   ├── PrincipalImage.tsx          # Hero section de la home
│   │   ├── TittleSetter.tsx            # Actualiza el <title> según la ruta
│   │   └── ui/
│   │       ├── BackButton.tsx
│   │       ├── EmployeeNavBar.tsx
│   │       └── ImageUploader.tsx
│   ├── modals/
│   │   └── SessionExpiredModal.tsx     # Modal global de sesión expirada
│   └── pages/
│       ├── Home.tsx                    # Página principal
│       ├── Login.tsx                   # Login con email/password y OAuth Google
│       ├── Logout.tsx                  # Cierre de sesión
│       ├── AuthCallback.tsx            # Callback OAuth (redirige tras Google login)
│       ├── AdminPanel.tsx              # Panel de acceso para ADMIN
│       ├── ManagerPanel.tsx            # Panel de acceso para MANAGER
│       └── ViewerPanel.tsx             # Panel de acceso para VIEWER
└── modules/
    └── admin/
        ├── pages/
        │   ├── UsersPage.tsx           # Gestión de cuentas (tabla + modales)
        │   └── AdminConfigPage.tsx     # Página de configuración del admin
        ├── components/
        │   ├── AccountForm.tsx         # Formulario de creación/edición de cuenta
        │   ├── AccountsTable.tsx       # Tabla de cuentas
        │   ├── AssignRoleModal.tsx     # Modal para asignar/cambiar rol y activar cuenta
        │   ├── CreateUserDialog.tsx    # Dialog para crear un empleado nuevo
        │   ├── EditUserForm.tsx        # Formulario de edición
        │   ├── EditAccountDialog.tsx   # Dialog de edición de cuenta
        │   ├── BulkUploadButton.tsx    # Botón de carga masiva
        │   └── ErrorAlert.tsx          # Alerta de error reutilizable
        └── hooks/
            ├── useGetAccounts.tsx
            ├── useGetAccountById.tsx
            ├── useRegisterAccount.tsx
            ├── useUpdateAccount.tsx
            └── useLogicalDeleteAccount.tsx
```

---

## Enrutamiento

El router está definido en `App.tsx`. Las rutas protegidas usan `ProtectedRoute`, que verifica si el usuario está autenticado y tiene el rol requerido.

| Ruta | Acceso | Componente |
|---|---|---|
| `/` | Público | `Home` |
| `/login` | Público | `Login` |
| `/logout` | Público | `Logout` |
| `/auth/callback` | Público | `AuthCallback` |
| `/viewer` | VIEWER | `ViewerPanel` |
| `/manager` | MANAGER, ADMIN | `ManagerPanel` |
| `/admin` | ADMIN | `AdminPanel` |
| `/admin/accounts` | ADMIN | `UsersPage` |
| `/admin/config` | ADMIN | `AdminConfigPage` |
| `/unauthorized` | Público | Mensaje de acceso denegado |
| `*` | Público | Redirige a `/` |

### ProtectedRoute

`ProtectedRoute` recibe un array `allowedRoles`. Si el usuario no está autenticado, redirige a `/login`. Si está autenticado pero no tiene el rol necesario, redirige a `/unauthorized`.

```tsx
<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
  <Route path="/admin" element={<AdminPanel />} />
</Route>
```

---

## Autenticación

### Contexto de usuario — `UserContext`

`UserContext` provee la sesión de Supabase y los datos del usuario a toda la app. Se inicializa al montar `UserProvider` y se actualiza con `onAuthStateChange`.

```ts
const { account, session, loading } = useUser();
```

| Campo | Tipo | Descripción |
|---|---|---|
| `account` | `Account \| null` | Datos del usuario: id, email, name, role |
| `session` | `Session \| null` | Sesión de Supabase con el access_token |
| `loading` | `boolean` | `true` mientras se verifica la sesión inicial |

Al detectar una sesión activa, `UserContext` llama a `GET /api/me` en el backend para obtener el rol del usuario.

### Login

La página `Login.tsx` ofrece dos métodos:

1. **Email y contraseña** — usa `supabase.auth.signInWithPassword()`. Tras el login exitoso, `onAuthStateChange` actualiza el contexto automáticamente.
2. **Google OAuth** — usa `supabase.auth.signInWithOAuth({ provider: 'google' })`. El callback llega a `/auth/callback`, donde `AuthCallback.tsx` escucha el evento `SIGNED_IN` y redirige a `/`.

### Cierre de sesión

`Logout.tsx` llama a `supabase.auth.signOut()` y redirige a `/login`.

### Sesión expirada

`SessionExpiredModal` es un modal global en `App.tsx`. Se activa llamando `window.__forceSessionExpired()` desde cualquier parte de la app cuando el backend responde `401`.

---

## Módulo Admin

### `AdminPanel`

Panel de entrada para usuarios con rol `ADMIN`. Muestra tarjetas de acceso a:
- Dashboard (`/admin/dashboard`)
- Gestión de Cuentas (`/admin/accounts`)
- Configuración (`/admin/config`)

### `UsersPage` — Gestión de Cuentas

Tabla de todos los usuarios del sistema (activos e inactivos). Funcionalidades:

- Buscar por email.
- Clic en una fila abre `AssignRoleModal` para gestionar rol y estado de la cuenta.
- Botón "Crear empleado" abre `CreateUserDialog`.

### `CreateUserDialog`

Dialog que contiene `AccountForm` en modo `register`. Al enviar, llama a `POST /api/users/provision` en el backend con:

```json
{
  "email": "empleado@empresa.com",
  "password": "contraseña",
  "name": "Nombre Completo",
  "roleName": "MANAGER"
}
```

El backend crea el usuario en Supabase Auth y le asigna el rol. Si falla, muestra un toast de error con el mensaje del servidor.

### `AssignRoleModal`

Modal que se abre al seleccionar un usuario en la tabla. Permite:

- Ver y cambiar el rol asignado (con confirmación via `AlertDialog`).
- Activar o desactivar la cuenta (eliminación lógica).

### `AccountForm`

Formulario reutilizable con los campos: nombre, correo, contraseña y rol. Usado en `CreateUserDialog`. Soporta modo `register` y `update`.

Props:

| Prop | Tipo | Descripción |
|---|---|---|
| `mode` | `"register" \| "update"` | Controla textos y validaciones |
| `initialData` | `Partial<AccountFormData>` | Valores iniciales para modo update |
| `onSubmit` | `(data) => void` | Callback al enviar el formulario |
| `disabled` | `boolean` | Bloquea el botón durante operaciones async |

---

## Componentes compartidos

### `Header`

Cabecera fija con el logo de Recíclame y el componente `RoleNavbar`.

### `RoleNavbar`

Navegación que cambia según el rol del usuario autenticado:

- **Sin sesión**: botón "Iniciar sesión".
- **VIEWER**: links de navegación (Reservas, Eventos, Academias).
- **ADMIN / MANAGER**: link al panel de herramientas correspondiente.

Siempre muestra el toggle de tema oscuro/claro (`ModeToggle`).

---

## Tema oscuro/claro

La app usa `ThemeProvider` de `next-themes` configurado con `storageKey: "vite-ui-theme"`. El toggle se encuentra en `RoleNavbar`. El tema por defecto es `light`.

---

## Alias de importación

El alias `@/` está configurado en Vite y apunta a `src/`. Se usa en toda la app para evitar rutas relativas largas.

```ts
import { Button } from "@/components/ui/button";
import { useUser } from "@/shared/context/UserContext";
```

---

## Notas de desarrollo

- Los componentes de `components/ui/` son generados por shadcn/ui sobre Radix UI. No editarlos manualmente salvo que sea necesario.
- Las variables CSS de marca (`--brand`, `--brand-light`, `--bg-light`, `--bg-dark`) están definidas en el CSS global y se usan con la sintaxis `bg-(--brand)` de Tailwind v4.
- Las notificaciones toast se muestran con `toast.success()` / `toast.error()` de Sonner. El `<Toaster richColors />` está montado en `App.tsx`.
- Las llamadas al backend siempre incluyen el header `Authorization: Bearer <access_token>` obtenido de `session.access_token` via `useUser()`.
