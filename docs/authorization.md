# Autorización

La autorización combina:

- Supabase Auth
- roles en tablas de aplicación
- RLS
- Edge Functions administrativas

## Reglas

- clientes no usan `service_role`
- operaciones administrativas sensibles salen del frontend y pasan por Edge Functions o RPC protegidas
- el acceso de lectura/escritura simple usa RLS como primera línea
