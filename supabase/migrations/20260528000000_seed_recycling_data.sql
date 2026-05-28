-- Seed mínimo para iteración 1 del flujo de segregación.
-- Crea una universidad, un campus, los 6 tipos de residuo y los 3 puntos de
-- reciclaje que el frontend usa como mocks. UUIDs fijos para que el cliente
-- pueda referenciarlos directamente.

insert into public.universities (id, name, is_active)
values ('00000000-0000-0000-0000-000000000001', 'Universidad de Ciencias y Humanidades', true)
on conflict (id) do nothing;

insert into public.campuses (id, university_id, name, address, is_active)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Campus Central',
  'Av. Universitaria',
  true
)
on conflict (id) do nothing;

insert into public.waste_types (id, name, description, is_active) values
  ('11111111-1111-1111-1111-000000000001', 'Papel y Carton',          'Contenedor de papel y carton',                       true),
  ('11111111-1111-1111-1111-000000000002', 'Plastico (PET)',          'Contenedor de plastico (PET)',                       true),
  ('11111111-1111-1111-1111-000000000003', 'No aprovechables',        'Contenedor de no aprovechables',                     true),
  ('11111111-1111-1111-1111-000000000004', 'Vidrio',                  'Contenedor de vidrio',                               true),
  ('11111111-1111-1111-1111-000000000005', 'Pilas',                   'Contenedor de pilas',                                true),
  ('11111111-1111-1111-1111-000000000006', 'RAEE',                    'Contenedor de residuos electricos y electronicos',   true)
on conflict (id) do nothing;

insert into public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) values
  ('22222222-2222-2222-2222-000000000001', '00000000-0000-0000-0000-000000000010', 'Contenedor Biblioteca Central',  -12.069200, -77.079400, 'Acepta papel/carton y plastico PET',         true),
  ('22222222-2222-2222-2222-000000000002', '00000000-0000-0000-0000-000000000010', 'Contenedor Estudios Generales',  -12.070100, -77.080600, 'Acepta vidrio y residuos no aprovechables',  true),
  ('22222222-2222-2222-2222-000000000003', '00000000-0000-0000-0000-000000000010', 'Punto Verde Complejo MacGregor', -12.068300, -77.078400, 'Acepta pilas y RAEE',                        true)
on conflict (id) do nothing;
