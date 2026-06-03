-- Seed de bin_types, mapeo waste_types.recommended_bin_type_id, y recycling_point_bins.
-- UUIDs fijos (33333333-...) para mantener coherencia con los mocks del frontend.

insert into public.bin_types (id, name) values
  ('33333333-3333-3333-3333-000000000001', 'Papel y Cartón'),
  ('33333333-3333-3333-3333-000000000002', 'Plástico PET'),
  ('33333333-3333-3333-3333-000000000003', 'No aprovechables'),
  ('33333333-3333-3333-3333-000000000004', 'Vidrio'),
  ('33333333-3333-3333-3333-000000000005', 'Pilas'),
  ('33333333-3333-3333-3333-000000000006', 'RAEE')
on conflict (id) do nothing;

update public.waste_types set recommended_bin_type_id = '33333333-3333-3333-3333-000000000001' where id = '11111111-1111-1111-1111-000000000001';
update public.waste_types set recommended_bin_type_id = '33333333-3333-3333-3333-000000000002' where id = '11111111-1111-1111-1111-000000000002';
update public.waste_types set recommended_bin_type_id = '33333333-3333-3333-3333-000000000003' where id = '11111111-1111-1111-1111-000000000003';
update public.waste_types set recommended_bin_type_id = '33333333-3333-3333-3333-000000000004' where id = '11111111-1111-1111-1111-000000000004';
update public.waste_types set recommended_bin_type_id = '33333333-3333-3333-3333-000000000005' where id = '11111111-1111-1111-1111-000000000005';
update public.waste_types set recommended_bin_type_id = '33333333-3333-3333-3333-000000000006' where id = '11111111-1111-1111-1111-000000000006';

-- Contenedor Biblioteca Central: Papel y Cartón + Plástico PET
insert into public.recycling_point_bins (recycling_point_id, bin_type_id) values
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000001'),
  ('22222222-2222-2222-2222-000000000001', '33333333-3333-3333-3333-000000000002')
on conflict (recycling_point_id, bin_type_id) do nothing;

-- Contenedor Estudios Generales: Vidrio + No aprovechables
insert into public.recycling_point_bins (recycling_point_id, bin_type_id) values
  ('22222222-2222-2222-2222-000000000002', '33333333-3333-3333-3333-000000000004'),
  ('22222222-2222-2222-2222-000000000002', '33333333-3333-3333-3333-000000000003')
on conflict (recycling_point_id, bin_type_id) do nothing;

-- Punto Verde Complejo MacGregor: Pilas + RAEE
insert into public.recycling_point_bins (recycling_point_id, bin_type_id) values
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000005'),
  ('22222222-2222-2222-2222-000000000003', '33333333-3333-3333-3333-000000000006')
on conflict (recycling_point_id, bin_type_id) do nothing;
