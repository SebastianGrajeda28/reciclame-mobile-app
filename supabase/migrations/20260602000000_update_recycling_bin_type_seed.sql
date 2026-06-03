alter table public.waste_types
drop column if exists recommended_bin_type_id;

insert into public.bin_types (id, university_id, name, color, description, is_active) values
  ('33333333-3333-3333-3333-000000000001', '00000000-0000-0000-0000-000000000001', 'Contenedor de plásticos',          '#2F80ED', 'Para plásticos PET y otros plásticos reciclables.', true),
  ('33333333-3333-3333-3333-000000000002', '00000000-0000-0000-0000-000000000001', 'Contenedor de no aprovechables',   '#4F4F4F', 'Para residuos no reciclables o contaminados.',       true),
  ('33333333-3333-3333-3333-000000000003', '00000000-0000-0000-0000-000000000001', 'Contenedor de vidrio',             '#27AE60', 'Para frascos, botellas y vidrio roto.',              true),
  ('33333333-3333-3333-3333-000000000004', '00000000-0000-0000-0000-000000000001', 'Contenedor de papel y cartón',     '#56CCF2', 'Para papel y cartón limpios.',                       true),
  ('33333333-3333-3333-3333-000000000005', '00000000-0000-0000-0000-000000000001', 'Contenedor de pilas',              '#EB5757', 'Para pilas y baterías pequeñas.',                    true),
  ('33333333-3333-3333-3333-000000000006', '00000000-0000-0000-0000-000000000001', 'Contenedor RAEE',                  '#9B51E0', 'Para residuos eléctricos y electrónicos.',           true)
on conflict (id) do update set
  university_id = excluded.university_id,
  name = excluded.name,
  color = excluded.color,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.waste_types (id, name, description, is_active) values
  ('11111111-1111-1111-1111-000000000001', 'Cartón',               null,                                                                                                      true),
  ('11111111-1111-1111-1111-000000000002', 'Plásticos PET',        'Botellas',                                                                                                true),
  ('11111111-1111-1111-1111-000000000003', 'Residuos generales',   'Resto de comida: huesos, servilletas sucias, papeles sucias, residuos con grasa, empaques de golosinas.', true),
  ('11111111-1111-1111-1111-000000000004', 'Vidrio',               'Frascos de vidrio, botellas de diferente tonalidad: verde transparente, oscura, vidrio roto, etc.',          true),
  ('11111111-1111-1111-1111-000000000005', 'Pilas',                null,                                                                                                      true),
  ('11111111-1111-1111-1111-000000000006', 'RAEE',                 'Residuos de Aparatos Eléctricos y electrónicos: baterías, cables, cargadores, celulares, pantallas, etc.',     true),
  ('11111111-1111-1111-1111-000000000007', 'Otros Plásticos',      null,                                                                                                      true),
  ('11111111-1111-1111-1111-000000000008', 'Metales',              'latas',                                                                                                   true),
  ('11111111-1111-1111-1111-000000000009', 'Papel',                'Hojas de papel, fotocopias, periódicos, revistas, folletos',                                               true),
  ('11111111-1111-1111-1111-000000000010', 'Residuos orgánicos',   'cáscaras de frutas o verduras',                                                                          true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) values
  ('22222222-2222-2222-2222-000000000001', '00000000-0000-0000-0000-000000000010', 'Contenedor Biblioteca Central',  -12.069200, -77.079400, 'Acepta papel, cartón y plásticos',              true),
  ('22222222-2222-2222-2222-000000000002', '00000000-0000-0000-0000-000000000010', 'Contenedor Estudios Generales',  -12.070100, -77.080600, 'Acepta vidrio y no aprovechables',             true),
  ('22222222-2222-2222-2222-000000000003', '00000000-0000-0000-0000-000000000010', 'Punto Verde Complejo MacGregor', -12.068300, -77.078400, 'Acepta pilas y RAEE',                          true)
on conflict (id) do update set
  campus_id = excluded.campus_id,
  name = excluded.name,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) values
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000002', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000002', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000006', true)
on conflict (recycling_point_id, bin_type_id) do update set
  is_active = excluded.is_active,
  updated_at = now();

insert into public.map_waste_type_bin_types (university_id, waste_type_id, bin_type_id, is_active) values
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000001', '33333333-3333-3333-3333-000000000004', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000002', '33333333-3333-3333-3333-000000000001', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000003', '33333333-3333-3333-3333-000000000002', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000004', '33333333-3333-3333-3333-000000000003', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000005', '33333333-3333-3333-3333-000000000005', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000006', '33333333-3333-3333-3333-000000000006', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000007', '33333333-3333-3333-3333-000000000001', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000008', '33333333-3333-3333-3333-000000000006', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000009', '33333333-3333-3333-3333-000000000004', true),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-000000000010', '33333333-3333-3333-3333-000000000002', true)
on conflict (university_id, waste_type_id, bin_type_id) do update set
  is_active = excluded.is_active,
  updated_at = now();
