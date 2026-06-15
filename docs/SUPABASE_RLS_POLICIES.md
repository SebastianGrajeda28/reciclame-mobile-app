# Políticas RLS de Supabase

Row Level Security (RLS) debe estar habilitado en las tablas críticas. Sin estas políticas la app no puede leer puntos de reciclaje ni guardar registros, aunque el usuario esté autenticado.

## Por qué es necesario

Supabase habilita RLS por defecto en tablas nuevas. El SQL Editor lo bypasea (actúa como superusuario), pero la app usa la `anon key` / `authenticated role` y queda bloqueada si no hay políticas SELECT o INSERT explícitas.

Síntoma típico: la consulta devuelve array vacío `[]` sin error, y la caché local nunca se llena.

## Políticas requeridas

Ejecutar en el **SQL Editor de Supabase** (o incluir en una migración):

```sql
-- Puntos de reciclaje: lectura para usuarios autenticados
CREATE POLICY "lectura puntos usuarios logueados"
  ON recycling_points
  FOR SELECT
  TO authenticated
  USING (true);

-- Contenedores de puntos: lectura para usuarios autenticados
CREATE POLICY "lectura bins usuarios logueados"
  ON recycling_point_bins
  FOR SELECT
  TO authenticated
  USING (true);

-- Registros de reciclaje: cada usuario solo puede insertar los suyos
CREATE POLICY "insertar registros propios"
  ON recycling_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Registros de reciclaje: cada usuario solo puede leer los suyos
CREATE POLICY "leer registros propios"
  ON recycling_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

El mismo SQL está en `supabase/migrations/20260615000000_rls_policies.sql`.

## Tablas afectadas

| Tabla | Operación | Rol | Condición |
|---|---|---|---|
| `recycling_points` | SELECT | authenticated | sin restricción |
| `recycling_point_bins` | SELECT | authenticated | sin restricción |
| `recycling_records` | INSERT | authenticated | `auth.uid() = user_id` |
| `recycling_records` | SELECT | authenticated | `auth.uid() = user_id` |

## Verificar que están activas

En Supabase → **Table Editor** → seleccionar la tabla → pestaña **Policies**. Si la lista está vacía, RLS está bloqueando todo.

También se puede consultar desde el SQL Editor:

```sql
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('recycling_points', 'recycling_point_bins', 'recycling_records')
ORDER BY tablename, cmd;
```