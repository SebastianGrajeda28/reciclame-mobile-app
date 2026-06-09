-- Alinea las categorías 1:1 con las 10 clases del modelo on-device.
-- Renombra "Papel y Carton" → "Papel" y "Plastico (PET)" → "Botella plastica".
-- Agrega Carton, Metal, Organico y Plastico que faltaban.

update public.waste_types
  set name = 'Papel', description = 'Contenedor de papel'
  where id = '11111111-1111-1111-1111-000000000001';

update public.waste_types
  set name = 'Botella plastica', description = 'Contenedor de botellas plasticas'
  where id = '11111111-1111-1111-1111-000000000002';

insert into public.waste_types (id, name, description, is_active) values
  ('11111111-1111-1111-1111-000000000007', 'Carton',    'Contenedor de carton',    true),
  ('11111111-1111-1111-1111-000000000008', 'Metal',     'Contenedor de metal',     true),
  ('11111111-1111-1111-1111-000000000009', 'Organico',  'Contenedor de organico',  true),
  ('11111111-1111-1111-1111-000000000010', 'Plastico',  'Contenedor de plastico',  true)
on conflict (id) do nothing;
