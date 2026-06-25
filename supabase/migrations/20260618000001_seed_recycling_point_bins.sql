-- PUCP: puntos de reciclaje reales (156 ubicaciones)
-- university_id (PUCP): 00000000-0000-0000-0000-000000000001
-- campus_id:            00000000-0000-0000-0000-000000000010
-- recycling_point ids:  22222222-2222-2222-2222-000000000004 .. 000000000159
-- (001-003 reservados por seed mock anterior)

-- ============================================================
-- Puerta Principal PUCP 1
-- id: 22222222-2222-2222-2222-000000000004
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000004', '00000000-0000-0000-0000-000000000010', 'Puerta Principal PUCP 1', -12.068799, -77.078351, 'Acepta Pilas y Baterías, Residuos Generales, Papel y Cartón, Vidrio, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000004', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Jardín Central PUCP 1
-- id: 22222222-2222-2222-2222-000000000005
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000005', '00000000-0000-0000-0000-000000000010', 'Jardín Central PUCP 1', -12.068890, -77.078600, 'Acepta Plástico, Papel y Cartón, Vidrio, Residuos Generales, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000005', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000005', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000005', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000005', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000005', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Exterior de Archivo PUCP 1
-- id: 22222222-2222-2222-2222-000000000006
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000006', '00000000-0000-0000-0000-000000000010', 'Exterior de Archivo PUCP 1', -12.067669, -77.078154, 'Acepta Papel y Cartón, Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000006', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000006', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000006', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000006', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Jardín de Baobabs 1
-- id: 22222222-2222-2222-2222-000000000007
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000007', '00000000-0000-0000-0000-000000000010', 'Jardín de Baobabs 1', -12.066997, -77.078157, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000007', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000007', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000007', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Puerta Rosales PUCP 1
-- id: 22222222-2222-2222-2222-000000000008
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000008', '00000000-0000-0000-0000-000000000010', 'Puerta Rosales PUCP 1', -12.066599, -77.078179, 'Acepta Pilas y Baterías, Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000008', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000008', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000008', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000008', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- FARES 1
-- id: 22222222-2222-2222-2222-000000000009
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000009', '00000000-0000-0000-0000-000000000010', 'FARES 1', -12.064992, -77.078589, 'Acepta Residuos Generales, Vidrio, Plástico, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000009', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000009', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000009', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000009', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- FARES 2
-- id: 22222222-2222-2222-2222-000000000010
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000010', '00000000-0000-0000-0000-000000000010', 'FARES 2', -12.064856, -77.078377, 'Acepta Papel y Cartón, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000010', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000010', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- FARES 3
-- id: 22222222-2222-2222-2222-000000000011
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000011', '00000000-0000-0000-0000-000000000010', 'FARES 3', -12.064719, -77.078414, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000011', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- FARES 4
-- id: 22222222-2222-2222-2222-000000000012
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000012', '00000000-0000-0000-0000-000000000010', 'FARES 4', -12.065286, -77.078668, 'Acepta Residuos Generales, Plástico, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000012', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000012', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000012', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- FARES 5
-- id: 22222222-2222-2222-2222-000000000013
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000013', '00000000-0000-0000-0000-000000000010', 'FARES 5', -12.065328, -77.078653, 'Acepta Papel y Cartón, Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000013', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000013', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000013', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000013', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- FARES 6
-- id: 22222222-2222-2222-2222-000000000014
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000014', '00000000-0000-0000-0000-000000000010', 'FARES 6', -12.065808, -77.078908, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000014', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Cancha de Fútbol PUCP 1
-- id: 22222222-2222-2222-2222-000000000015
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000015', '00000000-0000-0000-0000-000000000010', 'Cancha de Fútbol PUCP 1', -12.065623, -77.079416, 'Acepta Papel y Cartón, Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000015', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000015', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000015', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Gimnasio PUCP 1
-- id: 22222222-2222-2222-2222-000000000016
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000016', '00000000-0000-0000-0000-000000000010', 'Gimnasio PUCP 1', -12.066263, -77.079403, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000016', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000016', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000016', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Gimnasio PUCP 2
-- id: 22222222-2222-2222-2222-000000000017
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000017', '00000000-0000-0000-0000-000000000010', 'Gimnasio PUCP 2', -12.066084, -77.079688, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000017', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Coliseo Polideportivo PUCP 1
-- id: 22222222-2222-2222-2222-000000000018
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000018', '00000000-0000-0000-0000-000000000010', 'Coliseo Polideportivo PUCP 1', -12.066251, -77.079961, 'Acepta Residuos Generales, Vidrio, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000018', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000018', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000018', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Tontódromo PUCP 1
-- id: 22222222-2222-2222-2222-000000000019
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000019', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 1', -12.066383, -77.079720, 'Acepta Vidrio, Plástico, Residuos Generales, Papel y Cartón, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000019', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000019', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000019', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000019', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000019', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Coliseo Polideportivo PUCP 2
-- id: 22222222-2222-2222-2222-000000000020
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000020', '00000000-0000-0000-0000-000000000010', 'Coliseo Polideportivo PUCP 2', -12.066532, -77.079894, 'Acepta Residuos Generales, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000020', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000020', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Coliseo Polideportivo PUCP 3
-- id: 22222222-2222-2222-2222-000000000021
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000021', '00000000-0000-0000-0000-000000000010', 'Coliseo Polideportivo PUCP 3', -12.066634, -77.079905, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000021', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Tontódromo PUCP 2
-- id: 22222222-2222-2222-2222-000000000022
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000022', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 2', -12.066988, -77.079733, 'Acepta Residuos Generales, Papel y Cartón, Vidrio, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000022', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000022', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000022', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000022', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- FAD 1
-- id: 22222222-2222-2222-2222-000000000023
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000023', '00000000-0000-0000-0000-000000000010', 'FAD 1', -12.066727, -77.079367, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000023', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- FAD 2
-- id: 22222222-2222-2222-2222-000000000024
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000024', '00000000-0000-0000-0000-000000000010', 'FAD 2', -12.066902, -77.079368, 'Acepta Vidrio, Plástico, Papel y Cartón, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000024', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000024', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000024', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000024', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- FAD 3
-- id: 22222222-2222-2222-2222-000000000025
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000025', '00000000-0000-0000-0000-000000000010', 'FAD 3', -12.066905, -77.079120, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000025', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- FAD 4
-- id: 22222222-2222-2222-2222-000000000026
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000026', '00000000-0000-0000-0000-000000000010', 'FAD 4', -12.066796, -77.078782, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000026', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- FAD 5
-- id: 22222222-2222-2222-2222-000000000027
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000027', '00000000-0000-0000-0000-000000000010', 'FAD 5', -12.066717, -77.078785, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000027', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000027', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000027', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000027', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Jardín de Baobabs 2
-- id: 22222222-2222-2222-2222-000000000028
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000028', '00000000-0000-0000-0000-000000000010', 'Jardín de Baobabs 2', -12.067145, -77.078525, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000028', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Exterior de Vivero PUCP 1
-- id: 22222222-2222-2222-2222-000000000029
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000029', '00000000-0000-0000-0000-000000000010', 'Exterior de Vivero PUCP 1', -12.067185, -77.078778, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000029', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Exterior de Vivero PUCP 2
-- id: 22222222-2222-2222-2222-000000000030
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000030', '00000000-0000-0000-0000-000000000010', 'Exterior de Vivero PUCP 2', -12.067360, -77.078776, 'Acepta Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000030', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000030', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Jardín Xerofítico PUCP 1
-- id: 22222222-2222-2222-2222-000000000031
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000031', '00000000-0000-0000-0000-000000000010', 'Jardín Xerofítico PUCP 1', -12.068229, -77.078765, 'Acepta RAEE', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000031', '33333333-3333-3333-3333-000000000006', true);

-- ============================================================
-- Complejo Mac Gregor 1
-- id: 22222222-2222-2222-2222-000000000032
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000032', '00000000-0000-0000-0000-000000000010', 'Complejo Mac Gregor 1', -12.068384, -77.078693, 'Acepta Papel y Cartón, Plástico, Vidrio, Residuos Generales, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000032', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000032', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000032', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000032', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000032', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- FAE 1
-- id: 22222222-2222-2222-2222-000000000033
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000033', '00000000-0000-0000-0000-000000000010', 'FAE 1', -12.067660, -77.079298, 'Acepta Residuos Generales, Vidrio, Plástico, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000033', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000033', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000033', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000033', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Tontódromo PUCP 3
-- id: 22222222-2222-2222-2222-000000000034
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000034', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 3', -12.067724, -77.079711, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000034', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000034', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000034', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000034', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- EEGGLL 1
-- id: 22222222-2222-2222-2222-000000000035
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000035', '00000000-0000-0000-0000-000000000010', 'EEGGLL 1', -12.067548, -77.080159, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000035', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- EEGGLL 2
-- id: 22222222-2222-2222-2222-000000000036
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000036', '00000000-0000-0000-0000-000000000010', 'EEGGLL 2', -12.067704, -77.080383, 'Acepta Residuos Generales, Vidrio, Plástico, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000036', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000036', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000036', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000036', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- EEGGLL 3
-- id: 22222222-2222-2222-2222-000000000037
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000037', '00000000-0000-0000-0000-000000000010', 'EEGGLL 3', -12.067392, -77.080401, 'Acepta Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000037', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000037', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000037', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- EEGGLL 4
-- id: 22222222-2222-2222-2222-000000000038
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000038', '00000000-0000-0000-0000-000000000010', 'EEGGLL 4', -12.067381, -77.080367, 'Acepta Residuos Generales, Vidrio, Papel y Cartón, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000038', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000038', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000038', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000038', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- EEGGLL 5
-- id: 22222222-2222-2222-2222-000000000039
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000039', '00000000-0000-0000-0000-000000000010', 'EEGGLL 5', -12.067607, -77.080376, 'Acepta Residuos Generales, Vidrio, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000039', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000039', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000039', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Estacionamiento M. 1
-- id: 22222222-2222-2222-2222-000000000040
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000040', '00000000-0000-0000-0000-000000000010', 'Estacionamiento M. 1', -12.067075, -77.080467, 'Acepta Papel y Cartón, Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000040', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000040', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000040', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000040', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Coliseo Polideportivo PUCP 4
-- id: 22222222-2222-2222-2222-000000000041
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000041', '00000000-0000-0000-0000-000000000010', 'Coliseo Polideportivo PUCP 4', -12.066578, -77.080447, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000041', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000041', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000041', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000041', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Tuna PUCP 1
-- id: 22222222-2222-2222-2222-000000000042
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000042', '00000000-0000-0000-0000-000000000010', 'Tuna PUCP 1', -12.066491, -77.080722, 'Acepta Papel y Cartón, Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000042', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000042', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000042', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000042', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Instituto de Radioastronomía PUCP 1
-- id: 22222222-2222-2222-2222-000000000043
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000043', '00000000-0000-0000-0000-000000000010', 'Instituto de Radioastronomía PUCP 1', -12.065756, -77.081742, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000043', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000043', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000043', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Instituto de Radioastronomía PUCP 2
-- id: 22222222-2222-2222-2222-000000000044
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000044', '00000000-0000-0000-0000-000000000010', 'Instituto de Radioastronomía PUCP 2', -12.065580, -77.081599, 'Acepta Pilas y Baterías, Papel y Cartón, Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000044', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000044', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000044', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000044', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000044', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Estacionamiento M. 2
-- id: 22222222-2222-2222-2222-000000000045
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000045', '00000000-0000-0000-0000-000000000010', 'Estacionamiento M. 2', -12.066992, -77.081523, 'Acepta RAEE', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000045', '33333333-3333-3333-3333-000000000006', true);

-- ============================================================
-- Quiosco de Letras 1
-- id: 22222222-2222-2222-2222-000000000046
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000046', '00000000-0000-0000-0000-000000000010', 'Quiosco de Letras 1', -12.067206, -77.080973, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000046', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000046', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000046', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Pabellón de Aulas Móviles 1
-- id: 22222222-2222-2222-2222-000000000047
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000047', '00000000-0000-0000-0000-000000000010', 'Pabellón de Aulas Móviles 1', -12.067346, -77.081602, 'Acepta Residuos Generales, Plástico, Papel y Cartón, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000047', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000047', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000047', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000047', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- EEGGLL 6
-- id: 22222222-2222-2222-2222-000000000048
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000048', '00000000-0000-0000-0000-000000000010', 'EEGGLL 6', -12.067447, -77.080726, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000048', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000048', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000048', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- EEGGLL 7
-- id: 22222222-2222-2222-2222-000000000049
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000049', '00000000-0000-0000-0000-000000000010', 'EEGGLL 7', -12.067566, -77.080741, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000049', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000049', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000049', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Pastos de Psicología 1
-- id: 22222222-2222-2222-2222-000000000050
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000050', '00000000-0000-0000-0000-000000000010', 'Pastos de Psicología 1', -12.067909, -77.081234, 'Acepta Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000050', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000050', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- EEGGLL 8
-- id: 22222222-2222-2222-2222-000000000051
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000051', '00000000-0000-0000-0000-000000000010', 'EEGGLL 8', -12.067919, -77.080671, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000051', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000051', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000051', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- EEGGLL 9
-- id: 22222222-2222-2222-2222-000000000052
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000052', '00000000-0000-0000-0000-000000000010', 'EEGGLL 9', -12.067871, -77.080282, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000052', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000052', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000052', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- LEEX PUCP 1
-- id: 22222222-2222-2222-2222-000000000053
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000053', '00000000-0000-0000-0000-000000000010', 'LEEX PUCP 1', -12.067907, -77.079406, 'Acepta Residuos Generales, Vidrio, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000053', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000053', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000053', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Tinkuy 1
-- id: 22222222-2222-2222-2222-000000000054
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000054', '00000000-0000-0000-0000-000000000010', 'Tinkuy 1', -12.068188, -77.079277, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000054', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000054', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000054', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Tinkuy 2
-- id: 22222222-2222-2222-2222-000000000055
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000055', '00000000-0000-0000-0000-000000000010', 'Tinkuy 2', -12.068104, -77.079325, 'Acepta Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000055', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000055', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000055', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Tinkuy 3
-- id: 22222222-2222-2222-2222-000000000056
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000056', '00000000-0000-0000-0000-000000000010', 'Tinkuy 3', -12.068234, -77.079427, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000056', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000056', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000056', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Tinkuy 4
-- id: 22222222-2222-2222-2222-000000000057
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000057', '00000000-0000-0000-0000-000000000010', 'Tinkuy 4', -12.068268, -77.079279, 'Acepta Residuos Generales, Plástico, Papel y Cartón, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000057', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000057', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000057', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000057', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Tinkuy 5
-- id: 22222222-2222-2222-2222-000000000058
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000058', '00000000-0000-0000-0000-000000000010', 'Tinkuy 5', -12.068133, -77.079497, 'Acepta Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000058', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000058', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000058', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Tinkuy 6
-- id: 22222222-2222-2222-2222-000000000059
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000059', '00000000-0000-0000-0000-000000000010', 'Tinkuy 6', -12.068231, -77.079586, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000059', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000059', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000059', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Tontódromo PUCP 4
-- id: 22222222-2222-2222-2222-000000000060
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000060', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 4', -12.068282, -77.079644, 'Acepta Papel y Cartón, Plástico, Vidrio, Residuos Generales, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000060', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000060', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000060', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000060', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000060', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Comedor de Letras 1
-- id: 22222222-2222-2222-2222-000000000061
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000061', '00000000-0000-0000-0000-000000000010', 'Comedor de Letras 1', -12.068404, -77.079824, 'Acepta Residuos Generales, Vidrio, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000061', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000061', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000061', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Exterior del Dep. de Comunicaciones PUCP 1
-- id: 22222222-2222-2222-2222-000000000062
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000062', '00000000-0000-0000-0000-000000000010', 'Exterior del Dep. de Comunicaciones PUCP 1', -12.068437, -77.080450, 'Acepta Residuos Generales, Plástico, Vidrio, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000062', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000062', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000062', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000062', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Facultad de Psicología PUCP 1
-- id: 22222222-2222-2222-2222-000000000063
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000063', '00000000-0000-0000-0000-000000000010', 'Facultad de Psicología PUCP 1', -12.068134, -77.080653, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000063', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000063', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000063', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000063', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000063', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Exterior de Estudio de TV #2 1
-- id: 22222222-2222-2222-2222-000000000064
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000064', '00000000-0000-0000-0000-000000000010', 'Exterior de Estudio de TV #2 1', -12.068410, -77.080794, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000064', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000064', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000064', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Pastos de Psicología 2
-- id: 22222222-2222-2222-2222-000000000065
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000065', '00000000-0000-0000-0000-000000000010', 'Pastos de Psicología 2', -12.068707, -77.081259, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000065', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000065', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000065', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000065', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000065', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Estacionamiento L. 1
-- id: 22222222-2222-2222-2222-000000000066
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000066', '00000000-0000-0000-0000-000000000010', 'Estacionamiento L. 1', -12.068424, -77.081577, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000066', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Exterior de Pabellón Z 1
-- id: 22222222-2222-2222-2222-000000000067
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000067', '00000000-0000-0000-0000-000000000010', 'Exterior de Pabellón Z 1', -12.068887, -77.080829, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000067', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000067', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000067', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Exterior de Biblioteca Central PUCP 1
-- id: 22222222-2222-2222-2222-000000000068
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000068', '00000000-0000-0000-0000-000000000010', 'Exterior de Biblioteca Central PUCP 1', -12.068904, -77.080422, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000068', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000068', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000068', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Tontódromo PUCP 5
-- id: 22222222-2222-2222-2222-000000000069
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000069', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 5', -12.068703, -77.079684, 'Acepta Plástico, Residuos Generales, Papel y Cartón, Vidrio, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000069', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000069', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000069', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000069', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000069', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Comedor de Letras 2
-- id: 22222222-2222-2222-2222-000000000070
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000070', '00000000-0000-0000-0000-000000000010', 'Comedor de Letras 2', -12.068299, -77.079841, 'Acepta Residuos Generales, Papel y Cartón, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000070', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000070', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000070', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Jardín Central PUCP 2
-- id: 22222222-2222-2222-2222-000000000071
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000071', '00000000-0000-0000-0000-000000000010', 'Jardín Central PUCP 2', -12.069334, -77.078871, 'Acepta Residuos Generales, Papel y Cartón, Vidrio, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000071', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000071', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000071', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000071', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- DAP 1
-- id: 22222222-2222-2222-2222-000000000072
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000072', '00000000-0000-0000-0000-000000000010', 'DAP 1', -12.069632, -77.078886, 'Acepta Residuos Generales, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000072', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000072', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Estacionamiento B. PUCP 1
-- id: 22222222-2222-2222-2222-000000000073
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000073', '00000000-0000-0000-0000-000000000010', 'Estacionamiento B. PUCP 1', -12.069654, -77.078561, 'Acepta Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000073', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000073', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000073', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Estacionamiento B. PUCP 2
-- id: 22222222-2222-2222-2222-000000000074
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000074', '00000000-0000-0000-0000-000000000010', 'Estacionamiento B. PUCP 2', -12.069615, -77.078087, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000074', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Exterior de DAAD 1
-- id: 22222222-2222-2222-2222-000000000075
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000075', '00000000-0000-0000-0000-000000000010', 'Exterior de DAAD 1', -12.070164, -77.078811, 'Acepta Plástico, Residuos Generales, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000075', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000075', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000075', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Facultad de Arte 1
-- id: 22222222-2222-2222-2222-000000000076
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000076', '00000000-0000-0000-0000-000000000010', 'Facultad de Arte 1', -12.070134, -77.079185, 'Acepta Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000076', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000076', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Facultad de Arte 2
-- id: 22222222-2222-2222-2222-000000000077
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000077', '00000000-0000-0000-0000-000000000010', 'Facultad de Arte 2', -12.070299, -77.079101, 'Acepta Plástico, Residuos Generales, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000077', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000077', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000077', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Facultad de Arte 3
-- id: 22222222-2222-2222-2222-000000000078
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000078', '00000000-0000-0000-0000-000000000010', 'Facultad de Arte 3', -12.070404, -77.079208, 'Acepta Papel y Cartón, Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000078', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000078', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000078', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Facultad de Arte 4
-- id: 22222222-2222-2222-2222-000000000079
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000079', '00000000-0000-0000-0000-000000000010', 'Facultad de Arte 4', -12.070523, -77.079155, 'Acepta Residuos Generales, Papel y Cartón, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000079', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000079', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000079', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Exterior de DAAD 2
-- id: 22222222-2222-2222-2222-000000000080
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000080', '00000000-0000-0000-0000-000000000010', 'Exterior de DAAD 2', -12.070325, -77.078782, 'Acepta Residuos Generales, Plástico, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000080', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000080', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000080', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Exterior de DAAD 3
-- id: 22222222-2222-2222-2222-000000000081
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000081', '00000000-0000-0000-0000-000000000010', 'Exterior de DAAD 3', -12.070353, -77.078633, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000081', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000081', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000081', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Comedor de Arte 1
-- id: 22222222-2222-2222-2222-000000000082
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000082', '00000000-0000-0000-0000-000000000010', 'Comedor de Arte 1', -12.070486, -77.079475, 'Acepta Plástico, Papel y Cartón, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000082', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000082', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000082', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000082', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Tontódromo PUCP 6
-- id: 22222222-2222-2222-2222-000000000083
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000083', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 6', -12.070615, -77.079856, 'Acepta Plástico, Residuos Generales, Vidrio, Papel y Cartón, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000083', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000083', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000083', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000083', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000083', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- EEGGCC 1
-- id: 22222222-2222-2222-2222-000000000084
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000084', '00000000-0000-0000-0000-000000000010', 'EEGGCC 1', -12.071066, -77.079359, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000084', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000084', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000084', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- EEGGCC 2
-- id: 22222222-2222-2222-2222-000000000085
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000085', '00000000-0000-0000-0000-000000000010', 'EEGGCC 2', -12.071006, -77.079166, 'Acepta Residuos Generales, Plástico, Papel y Cartón, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000085', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000085', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000085', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000085', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- EEGGCC 3
-- id: 22222222-2222-2222-2222-000000000086
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000086', '00000000-0000-0000-0000-000000000010', 'EEGGCC 3', -12.070885, -77.079264, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000086', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000086', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000086', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- EEGGCC 4
-- id: 22222222-2222-2222-2222-000000000087
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000087', '00000000-0000-0000-0000-000000000010', 'EEGGCC 4', -12.071041, -77.079371, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000087', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000087', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000087', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Exterior de EEGGCC 1
-- id: 22222222-2222-2222-2222-000000000088
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000088', '00000000-0000-0000-0000-000000000010', 'Exterior de EEGGCC 1', -12.070796, -77.078735, 'Acepta Papel y Cartón, Plástico, Residuos Generales, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000088', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000088', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000088', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000088', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Estacionamiento C. 1
-- id: 22222222-2222-2222-2222-000000000089
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000089', '00000000-0000-0000-0000-000000000010', 'Estacionamiento C. 1', -12.070959, -77.078532, 'Acepta Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000089', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Puerta Ciencias PUCP 1
-- id: 22222222-2222-2222-2222-000000000090
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000090', '00000000-0000-0000-0000-000000000010', 'Puerta Ciencias PUCP 1', -12.071384, -77.078655, 'Acepta Pilas y Baterías, Plástico, Vidrio, Residuos Generales, RAEE', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000090', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000090', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000090', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000090', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000090', '33333333-3333-3333-3333-000000000006', true);

-- ============================================================
-- Exterior de FAC 1
-- id: 22222222-2222-2222-2222-000000000091
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000091', '00000000-0000-0000-0000-000000000010', 'Exterior de FAC 1', -12.071504, -77.078850, 'Acepta Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000091', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000091', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Plaza de EEGGCC 1
-- id: 22222222-2222-2222-2222-000000000092
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000092', '00000000-0000-0000-0000-000000000010', 'Plaza de EEGGCC 1', -12.071360, -77.079063, 'Acepta Vidrio, Residuos Generales, Plástico, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000092', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000092', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000092', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000092', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- El Puesto 1
-- id: 22222222-2222-2222-2222-000000000093
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000093', '00000000-0000-0000-0000-000000000010', 'El Puesto 1', -12.071373, -77.079391, 'Acepta Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000093', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000093', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Exterior de Gelarti 1
-- id: 22222222-2222-2222-2222-000000000094
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000094', '00000000-0000-0000-0000-000000000010', 'Exterior de Gelarti 1', -12.071450, -77.079674, 'Acepta Vidrio, Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000094', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000094', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000094', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Gelarti 1
-- id: 22222222-2222-2222-2222-000000000095
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000095', '00000000-0000-0000-0000-000000000010', 'Gelarti 1', -12.071490, -77.079882, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000095', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Tontódromo PUCP 7
-- id: 22222222-2222-2222-2222-000000000096
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000096', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 7', -12.071101, -77.079914, 'Acepta Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000096', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000096', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000096', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Exterior de FAC 2
-- id: 22222222-2222-2222-2222-000000000097
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000097', '00000000-0000-0000-0000-000000000010', 'Exterior de FAC 2', -12.071646, -77.078923, 'Acepta Residuos Generales, Vidrio, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000097', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000097', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000097', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Exterior de Pabellón Q 1
-- id: 22222222-2222-2222-2222-000000000098
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000098', '00000000-0000-0000-0000-000000000010', 'Exterior de Pabellón Q 1', -12.072224, -77.079123, 'Acepta Pilas y Baterías, Vidrio, Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000098', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000098', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000098', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000098', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Exterior de Pabellón Q 2
-- id: 22222222-2222-2222-2222-000000000099
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000099', '00000000-0000-0000-0000-000000000010', 'Exterior de Pabellón Q 2', -12.072254, -77.079360, 'Acepta Vidrio, Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000099', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000099', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000099', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Pabellón Q 1
-- id: 22222222-2222-2222-2222-000000000100
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000100', '00000000-0000-0000-0000-000000000010', 'Pabellón Q 1', -12.071973, -77.079348, 'Acepta Plástico, Papel y Cartón, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000100', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000100', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000100', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- CEPREPUCP 1
-- id: 22222222-2222-2222-2222-000000000101
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000101', '00000000-0000-0000-0000-000000000010', 'CEPREPUCP 1', -12.072825, -77.078924, 'Acepta Papel y Cartón, Vidrio, Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000101', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000101', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000101', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000101', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- FACI 1
-- id: 22222222-2222-2222-2222-000000000102
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000102', '00000000-0000-0000-0000-000000000010', 'FACI 1', -12.072609, -77.079551, 'Acepta Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000102', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Exterior de FACI 1
-- id: 22222222-2222-2222-2222-000000000103
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000103', '00000000-0000-0000-0000-000000000010', 'Exterior de FACI 1', -12.072451, -77.079920, 'Acepta Plástico, Vidrio, Residuos Generales, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000103', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000103', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000103', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000103', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Aulario PUCP 1
-- id: 22222222-2222-2222-2222-000000000104
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000104', '00000000-0000-0000-0000-000000000010', 'Aulario PUCP 1', -12.072791, -77.079696, 'Acepta Pilas y Baterías, Papel y Cartón, Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000104', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000104', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000104', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000104', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000104', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Aulario PUCP 2
-- id: 22222222-2222-2222-2222-000000000105
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000105', '00000000-0000-0000-0000-000000000010', 'Aulario PUCP 2', -12.072801, -77.079570, 'Acepta Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000105', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000105', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Aulario PUCP 3
-- id: 22222222-2222-2222-2222-000000000106
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000106', '00000000-0000-0000-0000-000000000010', 'Aulario PUCP 3', -12.072805, -77.079374, 'Acepta Plástico, Vidrio, Papel y Cartón, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000106', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000106', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000106', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000106', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Aulario PUCP 4
-- id: 22222222-2222-2222-2222-000000000107
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000107', '00000000-0000-0000-0000-000000000010', 'Aulario PUCP 4', -12.072834, -77.079245, 'Acepta Residuos Generales, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000107', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000107', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Tontódromo PUCP 8
-- id: 22222222-2222-2222-2222-000000000108
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000108', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 8', -12.069097, -77.079694, 'Acepta Residuos Generales, Plástico, Papel y Cartón, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000108', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000108', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000108', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000108', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Exterior Biblioteca Central 1
-- id: 22222222-2222-2222-2222-000000000109
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000109', '00000000-0000-0000-0000-000000000010', 'Exterior Biblioteca Central 1', -12.069121, -77.079816, 'Acepta Residuos Generales, Plástico, Papel y Cartón, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000109', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000109', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000109', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000109', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Exterior Biblioteca Central 2
-- id: 22222222-2222-2222-2222-000000000110
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000110', '00000000-0000-0000-0000-000000000010', 'Exterior Biblioteca Central 2', -12.069027, -77.079886, 'Acepta Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000110', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Biblioteca Central PUCP 1
-- id: 22222222-2222-2222-2222-000000000111
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000111', '00000000-0000-0000-0000-000000000010', 'Biblioteca Central PUCP 1', -12.069094, -77.080169, 'Acepta Residuos Generales, Papel y Cartón, Plástico, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000111', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000111', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000111', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000111', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Exterior de Pabellón Z 2
-- id: 22222222-2222-2222-2222-000000000112
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000112', '00000000-0000-0000-0000-000000000010', 'Exterior de Pabellón Z 2', -12.069021, -77.080570, 'Acepta Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000112', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000112', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Exterior de Pabellón Z 3
-- id: 22222222-2222-2222-2222-000000000113
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000113', '00000000-0000-0000-0000-000000000010', 'Exterior de Pabellón Z 3', -12.069010, -77.080688, 'Acepta Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000113', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000113', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Pabellón Z 1
-- id: 22222222-2222-2222-2222-000000000114
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000114', '00000000-0000-0000-0000-000000000010', 'Pabellón Z 1', -12.069134, -77.081407, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000114', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000114', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000114', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000114', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Exterior de Pabellón Z 4
-- id: 22222222-2222-2222-2222-000000000115
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000115', '00000000-0000-0000-0000-000000000010', 'Exterior de Pabellón Z 4', -12.069274, -77.081250, 'Acepta Pilas y Baterías, Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000115', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000115', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000115', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000115', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000115', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Pabellón Z 2
-- id: 22222222-2222-2222-2222-000000000116
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000116', '00000000-0000-0000-0000-000000000010', 'Pabellón Z 2', -12.069227, -77.080872, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000116', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000116', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000116', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000116', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Pabellón H 1
-- id: 22222222-2222-2222-2222-000000000117
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000117', '00000000-0000-0000-0000-000000000010', 'Pabellón H 1', -12.069522, -77.081512, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000117', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000117', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000117', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Puerta Riva Agúero PUCP 1
-- id: 22222222-2222-2222-2222-000000000118
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000118', '00000000-0000-0000-0000-000000000010', 'Puerta Riva Agúero PUCP 1', -12.069541, -77.081735, 'Acepta Pilas y Baterías, Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000118', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000118', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000118', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000118', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000118', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Estacionamiento L. 2
-- id: 22222222-2222-2222-2222-000000000119
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000119', '00000000-0000-0000-0000-000000000010', 'Estacionamiento L. 2', -12.069877, -77.081982, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000119', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Parque del Comedor Central 1
-- id: 22222222-2222-2222-2222-000000000120
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000120', '00000000-0000-0000-0000-000000000010', 'Parque del Comedor Central 1', -12.070101, -77.081707, 'Acepta Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000120', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Exterior de GHOT 1
-- id: 22222222-2222-2222-2222-000000000121
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000121', '00000000-0000-0000-0000-000000000010', 'Exterior de GHOT 1', -12.070684, -77.081897, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000121', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000121', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000121', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000121', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Pastos de Civil 1
-- id: 22222222-2222-2222-2222-000000000122
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000122', '00000000-0000-0000-0000-000000000010', 'Pastos de Civil 1', -12.071580, -77.082217, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000122', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000122', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000122', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000122', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Estacionamiento L. 3
-- id: 22222222-2222-2222-2222-000000000123
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000123', '00000000-0000-0000-0000-000000000010', 'Estacionamiento L. 3', -12.072188, -77.082715, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000123', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Pabellón O. 1
-- id: 22222222-2222-2222-2222-000000000124
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000124', '00000000-0000-0000-0000-000000000010', 'Pabellón O. 1', -12.072794, -77.082930, 'Acepta Papel y Cartón, Vidrio, Plástico, Residuos Generales, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000124', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000124', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000124', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000124', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000124', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Puerta Urubamba PUCP 1
-- id: 22222222-2222-2222-2222-000000000125
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000125', '00000000-0000-0000-0000-000000000010', 'Puerta Urubamba PUCP 1', -12.073269, -77.082355, 'Acepta Residuos Generales, Plástico, Vidrio, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000125', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000125', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000125', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000125', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Puerta Urubamba PUCP 2
-- id: 22222222-2222-2222-2222-000000000126
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000126', '00000000-0000-0000-0000-000000000010', 'Puerta Urubamba PUCP 2', -12.073321, -77.082246, 'Acepta Papel y Cartón, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000126', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000126', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Digimundo 1
-- id: 22222222-2222-2222-2222-000000000127
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000127', '00000000-0000-0000-0000-000000000010', 'Digimundo 1', -12.073485, -77.080845, 'Acepta Papel y Cartón, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000127', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000127', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Digimundo 2
-- id: 22222222-2222-2222-2222-000000000128
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000128', '00000000-0000-0000-0000-000000000010', 'Digimundo 2', -12.073248, -77.081262, 'Acepta Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000128', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Digimundo 3
-- id: 22222222-2222-2222-2222-000000000129
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000129', '00000000-0000-0000-0000-000000000010', 'Digimundo 3', -12.073300, -77.081366, 'Acepta Residuos Generales, Vidrio, Papel y Cartón, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000129', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000129', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000129', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000129', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Pabellón V 1
-- id: 22222222-2222-2222-2222-000000000130
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000130', '00000000-0000-0000-0000-000000000010', 'Pabellón V 1', -12.072997, -77.081885, 'Acepta Residuos Generales, Vidrio, Plástico, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000130', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000130', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000130', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000130', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Exterior de Diodo 1
-- id: 22222222-2222-2222-2222-000000000131
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000131', '00000000-0000-0000-0000-000000000010', 'Exterior de Diodo 1', -12.072837, -77.082111, 'Acepta Vidrio, Plástico, Residuos Generales, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000131', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000131', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000131', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000131', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Estacionamiento J. 1
-- id: 22222222-2222-2222-2222-000000000132
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000132', '00000000-0000-0000-0000-000000000010', 'Estacionamiento J. 1', -12.071953, -77.082162, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000132', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000132', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000132', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Estacionamiento J. 2
-- id: 22222222-2222-2222-2222-000000000133
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000133', '00000000-0000-0000-0000-000000000010', 'Estacionamiento J. 2', -12.071734, -77.082011, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000133', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000133', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000133', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Estacionamiento J. 3
-- id: 22222222-2222-2222-2222-000000000134
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000134', '00000000-0000-0000-0000-000000000010', 'Estacionamiento J. 3', -12.072055, -77.081758, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000134', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000134', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000134', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Pastos de Civil 2
-- id: 22222222-2222-2222-2222-000000000135
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000135', '00000000-0000-0000-0000-000000000010', 'Pastos de Civil 2', -12.071897, -77.081353, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón, RAEE', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000135', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000135', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000135', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000135', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000135', '33333333-3333-3333-3333-000000000006', true);

-- ============================================================
-- Pabellón M 1
-- id: 22222222-2222-2222-2222-000000000136
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000136', '00000000-0000-0000-0000-000000000010', 'Pabellón M 1', -12.072012, -77.081438, 'Acepta Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000136', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Exterior FAU 1
-- id: 22222222-2222-2222-2222-000000000137
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000137', '00000000-0000-0000-0000-000000000010', 'Exterior FAU 1', -12.072015, -77.081011, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000137', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000137', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000137', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Pabellón U 1
-- id: 22222222-2222-2222-2222-000000000138
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000138', '00000000-0000-0000-0000-000000000010', 'Pabellón U 1', -12.072283, -77.081197, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000138', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Tontódromo PUCP 9
-- id: 22222222-2222-2222-2222-000000000139
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000139', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 9', -12.071534, -77.080028, 'Acepta Pilas y Baterías, Vidrio, Plástico, Residuos Generales, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000139', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000139', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000139', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000139', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000139', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- FAU 1
-- id: 22222222-2222-2222-2222-000000000140
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000140', '00000000-0000-0000-0000-000000000010', 'FAU 1', -12.071407, -77.080659, 'Acepta Residuos Generales, Vidrio, Papel y Cartón, Plástico', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000140', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000140', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000140', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000140', '33333333-3333-3333-3333-000000000001', true);

-- ============================================================
-- Comedor Central PUCP 1
-- id: 22222222-2222-2222-2222-000000000141
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000141', '00000000-0000-0000-0000-000000000010', 'Comedor Central PUCP 1', -12.070488, -77.081202, 'Acepta Residuos Generales, Papel y Cartón, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000141', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000141', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000141', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Parque del Comedor Central 2
-- id: 22222222-2222-2222-2222-000000000142
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000142', '00000000-0000-0000-0000-000000000010', 'Parque del Comedor Central 2', -12.070275, -77.081062, 'Acepta Vidrio, Plástico, Residuos Generales, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000142', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000142', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000142', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000142', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Parque del Comedor Central 3
-- id: 22222222-2222-2222-2222-000000000143
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000143', '00000000-0000-0000-0000-000000000010', 'Parque del Comedor Central 3', -12.070198, -77.081042, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000143', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000143', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000143', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Auditorio de Derecho 1
-- id: 22222222-2222-2222-2222-000000000144
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000144', '00000000-0000-0000-0000-000000000010', 'Auditorio de Derecho 1', -12.069975, -77.081313, 'Acepta Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000144', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000144', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000144', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Pabellón H 2
-- id: 22222222-2222-2222-2222-000000000145
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000145', '00000000-0000-0000-0000-000000000010', 'Pabellón H 2', -12.069718, -77.081123, 'Acepta Papel y Cartón, Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000145', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000145', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000145', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000145', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Plaza de la Facultad de Derecho 1
-- id: 22222222-2222-2222-2222-000000000146
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000146', '00000000-0000-0000-0000-000000000010', 'Plaza de la Facultad de Derecho 1', -12.069935, -77.080838, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000146', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000146', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000146', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000146', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Exterior de DTI PUCP 1
-- id: 22222222-2222-2222-2222-000000000147
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000147', '00000000-0000-0000-0000-000000000010', 'Exterior de DTI PUCP 1', -12.070492, -77.080394, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000147', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000147', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000147', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000147', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Exterior de CCSS 1
-- id: 22222222-2222-2222-2222-000000000148
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000148', '00000000-0000-0000-0000-000000000010', 'Exterior de CCSS 1', -12.070635, -77.080562, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000148', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Parque del Comedor Central 4
-- id: 22222222-2222-2222-2222-000000000149
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000149', '00000000-0000-0000-0000-000000000010', 'Parque del Comedor Central 4', -12.070799, -77.080756, 'Acepta Vidrio, Plástico, Residuos Generales, Pilas y Baterías', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000149', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000149', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000149', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000149', '33333333-3333-3333-3333-000000000005', true);

-- ============================================================
-- Quiosco de Sociales 1
-- id: 22222222-2222-2222-2222-000000000150
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000150', '00000000-0000-0000-0000-000000000010', 'Quiosco de Sociales 1', -12.070638, -77.080596, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000150', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Frutilla 1
-- id: 22222222-2222-2222-2222-000000000151
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000151', '00000000-0000-0000-0000-000000000010', 'Frutilla 1', -12.070759, -77.080570, 'Acepta Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000151', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Exterior de CCSS 2
-- id: 22222222-2222-2222-2222-000000000152
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000152', '00000000-0000-0000-0000-000000000010', 'Exterior de CCSS 2', -12.071016, -77.080121, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000152', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000152', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000152', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000152', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Exterior de EEGGCC 2
-- id: 22222222-2222-2222-2222-000000000153
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000153', '00000000-0000-0000-0000-000000000010', 'Exterior de EEGGCC 2', -12.071089, -77.079899, 'Acepta Plástico, Vidrio, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000153', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000153', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000153', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Jardín de las Frutas 1
-- id: 22222222-2222-2222-2222-000000000154
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000154', '00000000-0000-0000-0000-000000000010', 'Jardín de las Frutas 1', -12.070253, -77.080070, 'Acepta Pilas y Baterías, Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000154', '33333333-3333-3333-3333-000000000005', true),
  ('22222222-2222-2222-2222-000000000154', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000154', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000154', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000154', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Dirección de Asuntos Estudiantiles 1
-- id: 22222222-2222-2222-2222-000000000155
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000155', '00000000-0000-0000-0000-000000000010', 'Dirección de Asuntos Estudiantiles 1', -12.069648, -77.079605, 'Acepta Papel y Cartón, Plástico, Residuos Generales, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000155', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000155', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000155', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000155', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Tontódromo PUCP 10
-- id: 22222222-2222-2222-2222-000000000156
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000156', '00000000-0000-0000-0000-000000000010', 'Tontódromo PUCP 10', -12.069865, -77.079759, 'Acepta Papel y Cartón, Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000156', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000156', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000156', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000156', '33333333-3333-3333-3333-000000000002', true);

-- ============================================================
-- Exterior Biblioteca Central 3
-- id: 22222222-2222-2222-2222-000000000157
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000157', '00000000-0000-0000-0000-000000000010', 'Exterior Biblioteca Central 3', -12.069336, -77.080076, 'Acepta Residuos Generales, Plástico, Vidrio, Papel y Cartón', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000157', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000157', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000157', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000157', '33333333-3333-3333-3333-000000000004', true);

-- ============================================================
-- Exterior Biblioteca Central 4
-- id: 22222222-2222-2222-2222-000000000158
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000158', '00000000-0000-0000-0000-000000000010', 'Exterior Biblioteca Central 4', -12.069349, -77.080466, 'Acepta Residuos Generales, Plástico, Vidrio', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000158', '33333333-3333-3333-3333-000000000002', true),
  ('22222222-2222-2222-2222-000000000158', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000158', '33333333-3333-3333-3333-000000000003', true);

-- ============================================================
-- Exterior de CCSS 3
-- id: 22222222-2222-2222-2222-000000000159
-- ============================================================

INSERT INTO public.recycling_points (id, campus_id, name, latitude, longitude, description, is_active) VALUES
  ('22222222-2222-2222-2222-000000000159', '00000000-0000-0000-0000-000000000010', 'Exterior de CCSS 3', -12.070717, -77.080249, 'Acepta Papel y Cartón, Vidrio, Plástico, Residuos Generales', true);

INSERT INTO public.recycling_point_bins (recycling_point_id, bin_type_id, is_active) VALUES
  ('22222222-2222-2222-2222-000000000159', '33333333-3333-3333-3333-000000000004', true),
  ('22222222-2222-2222-2222-000000000159', '33333333-3333-3333-3333-000000000003', true),
  ('22222222-2222-2222-2222-000000000159', '33333333-3333-3333-3333-000000000001', true),
  ('22222222-2222-2222-2222-000000000159', '33333333-3333-3333-3333-000000000002', true);
