# Web

Aplicacion web administrativa de Reciclame dentro del monorepo.

## Desarrollo

```sh
bun run web:dev
```

## Variables de entorno

Este frontend usa Supabase directamente.

Variables minimas:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Variable opcional:

- `VITE_BACKEND_URL_MEDIA` para recursos legacy de media mientras se mueven a Storage o assets propios.
