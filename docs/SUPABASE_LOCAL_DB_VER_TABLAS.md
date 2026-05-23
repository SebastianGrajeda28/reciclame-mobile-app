# Supabase Local — Documentación de Base de Datos

## Cómo funciona Supabase local

Supabase levanta un conjunto de servicios mediante Docker. Al iniciar, expone tres puertos principales:

| Servicio        | Puerto  | Uso                                       |
| --------------- | ------- | ----------------------------------------- |
| API Gateway     | `54321` | Punto de entrada para la app (REST, Auth) |
| PostgreSQL      | `54322` | Conexión directa a la base de datos       |
| Supabase Studio | `54323` | Interfaz web de administración            |

La aplicación siempre se conecta al puerto `54321`. Supabase internamente enruta esas solicitudes a PostgreSQL en el `54322`. Las herramientas externas como pgAdmin se conectan directamente al `54322`.

```
App (Expo/Next/etc.)
      |
   54321  ← API Supabase (Kong)
      |
   54322  ← PostgreSQL
```

---

## Comandos disponibles (`package.json`)

```bash
bun run db:start    # Levanta todos los servicios de Supabase con Docker
bun run db:stop     # Detiene todos los servicios
bun run db:status   # Muestra URLs, puertos y estado de los contenedores
bun run db:reset    # Elimina y recrea la base de datos completa
```

`db:reset` es el comando más importante en desarrollo. Ejecuta el siguiente flujo en orden:

1. Elimina la base de datos actual
2. Crea una base de datos nueva
3. Ejecuta todas las migraciones en orden ascendente
4. Ejecuta `seed.sql` si existe

> **Advertencia:** `db:reset` borra todos los datos. Solo debe usarse en entornos locales de desarrollo.

---

## Migraciones SQL

Las migraciones viven en `supabase/migrations/`. Supabase las ejecuta en orden ascendente según el nombre del archivo.

```
supabase/migrations/
  20240517000000_health_check.sql
  20260522000001_create_tables.sql
  20260522000002_clear_tables.sql
```

Se ejecutan automáticamente con `db:reset` o manualmente con:

```bash
supabase migration up
```

### Buenas prácticas

- Una migración por cambio significativo.
- Usar `TRUNCATE` para limpiar datos; nunca `DROP TABLE` en migraciones normales.
- No incluir archivos que eliminen tablas dentro de `supabase/migrations/`, ya que se ejecutarán automáticamente en cada reset y pueden borrar la estructura completa de la base de datos.

Si se necesita un rollback o eliminación puntual, hacerlo con un script manual fuera de la carpeta de migraciones.

---

## Problema común: tablas que no aparecen

Si las tablas no aparecen en pgAdmin o en la terminal después de un `db:reset`, la causa más probable es que existe una migración que las elimina después de crearlas. Por ejemplo:

```
20260522000001_create_tables.sql   → CREA tablas
20260522000002_clear_tables.sql    → TRUNCATE (limpia datos)
20260522000003_delete_tables.sql   → DROP TABLE (elimina tablas)
```

El resultado es que las tablas se crean y luego se destruyen en el mismo reset.

**Solución:** eliminar o mover fuera de `supabase/migrations/` cualquier archivo que ejecute `DROP TABLE`, y volver a correr `bun run db:reset`.

---

## Verificar las tablas creadas

### Opción 1 — pgAdmin (GUI, cualquier SO)

Datos de conexión:

| Campo    | Valor       |
| -------- | ----------- |
| Host     | `127.0.0.1` |
| Port     | `54322`     |
| Database | `postgres`  |
| Username | `postgres`  |
| Password | `postgres`  |

Ruta para ver las tablas:

```
Servers > Supabase Local > Databases > postgres > Schemas > public > Tables
```

Si las tablas no aparecen, hacer clic derecho en `Tables` y seleccionar **Refresh**.

---

### Opción 2 — DBeaver / TablePlus (GUI, cualquier SO)

Usar los mismos datos de conexión que pgAdmin. El tipo de conexión debe ser **PostgreSQL**.

---

### Opción 3 — Terminal con `psql` (Linux / macOS / Fedora)

Conectarse directamente a la instancia local:

```bash
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres
```

Contraseña: `postgres`

Comandos útiles dentro de `psql`:

```sql
-- Listar todas las tablas del schema public
\dt public.*

-- Ver columnas de una tabla específica
\d nombre_tabla

-- Ver todas las tablas con tamaño y descripción
\dt+

-- Salir
\q
```

---

### Opción 4 — Supabase Studio (web, cualquier SO)

Para que Studio esté disponible, verificar que en `supabase/config.toml` el campo `enabled` esté en `true`:

```toml
[studio]
enabled = true
port = 54323
api_url = "http://127.0.0.1"
```

Luego abrir en el navegador:

```
http://127.0.0.1:54323
```

Ir a **Table Editor** para ver y consultar las tablas visualmente.

---

### Opción 5 — Verificar puerto activo (Linux / Fedora)

Confirmar que PostgreSQL está escuchando en el puerto `54322`:

```bash
# Con ss (recomendado en Fedora/RHEL)
ss -tlnp | grep 54322

# O con netstat si está instalado
netstat -tlnp | grep 54322
```

El resultado esperado debe incluir `LISTEN`. Si no aparece, ejecutar `bun run db:start` primero.

Para instalar `netstat` en Fedora:

```bash
sudo dnf install net-tools
```
