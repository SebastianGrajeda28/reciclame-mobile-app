alter table public.waste_types
  add column if not exists estimated_weight_g numeric not null default 50;

update public.waste_types set estimated_weight_g = 150  where id = '11111111-1111-1111-1111-000000000001'; -- Cartón
update public.waste_types set estimated_weight_g = 30   where id = '11111111-1111-1111-1111-000000000002'; -- Plásticos PET
update public.waste_types set estimated_weight_g = 100  where id = '11111111-1111-1111-1111-000000000003'; -- Residuos generales
update public.waste_types set estimated_weight_g = 200  where id = '11111111-1111-1111-1111-000000000004'; -- Vidrio
update public.waste_types set estimated_weight_g = 20   where id = '11111111-1111-1111-1111-000000000005'; -- Pilas
update public.waste_types set estimated_weight_g = 500  where id = '11111111-1111-1111-1111-000000000006'; -- RAEE
update public.waste_types set estimated_weight_g = 40   where id = '11111111-1111-1111-1111-000000000007'; -- Otros Plásticos
update public.waste_types set estimated_weight_g = 15   where id = '11111111-1111-1111-1111-000000000008'; -- Metales
update public.waste_types set estimated_weight_g = 80   where id = '11111111-1111-1111-1111-000000000009'; -- Papel
update public.waste_types set estimated_weight_g = 100  where id = '11111111-1111-1111-1111-000000000010'; -- Residuos orgánicos
