-- Implements the cosmetic unlock system (issue #174).
-- 1. Adds item_key + item_type to rewards so each reward maps to an avatar cosmetic style.
-- 2. Seeds 25 cosmetic rewards (one per achievement) with fixed UUIDs.
--    item_type: hat | clothes | beard | moustache
--    Unlocking a cosmetic grants the style in ALL its colors.
-- 3. Links each achievement to its cosmetic reward via reward_id.
-- 4. Seeds 20 starter cosmetics and grants them to all existing users.
-- 5. Updates handle_new_user to grant starter cosmetics to new users on signup.
-- 6. Replaces check_and_unlock_achievements to auto-insert user_rewards on unlock.

-- ── Step 1: Add cosmetic columns to rewards ───────────────────────────────────
ALTER TABLE public.rewards
  ADD COLUMN IF NOT EXISTS item_key  TEXT,
  ADD COLUMN IF NOT EXISTS item_type TEXT;

-- ── Step 2: Seed 25 achievement cosmetic rewards ──────────────────────────────
-- UUIDs: 44444444-4444-4444-4444-000000000001 .. 000000000025
INSERT INTO public.rewards (id, name, description, reward_type, item_type, item_key, is_active)
VALUES
  -- Progression achievements
  ('44444444-4444-4444-4444-000000000001', 'Jubón',             'Jubón elegante en todos sus colores',              'cosmetic', 'clothes',   'doublet',     true),
  ('44444444-4444-4444-4444-000000000002', 'Gorro Beanie',      'Gorro beanie en todos sus colores',                'cosmetic', 'hat',       'beanie',      true),
  ('44444444-4444-4444-4444-000000000003', 'Túnica',            'Túnica mística en todos sus colores',              'cosmetic', 'clothes',   'robe',        true),
  ('44444444-4444-4444-4444-000000000004', 'Gorro Trampero',    'Gorro de trampero en todos sus colores',           'cosmetic', 'hat',       'trapper',     true),
  ('44444444-4444-4444-4444-000000000005', 'Sombrero de Copa',  'Sombrero de copa en todos sus colores',            'cosmetic', 'hat',       'tall',        true),
  ('44444444-4444-4444-4444-000000000006', 'Casco Guerrero',    'Casco legendario de guerrero en todos sus colores','cosmetic', 'hat',       'warrior',     true),
  -- Waste-type achievements
  ('44444444-4444-4444-4444-000000000007', 'Gorro Ingeniero',   'Gorro de ingeniero en todos sus colores',          'cosmetic', 'hat',       'engineer',    true),
  ('44444444-4444-4444-4444-000000000008', 'Casco Soldado',     'Casco de soldado en todos sus colores',            'cosmetic', 'hat',       'soldier',     true),
  ('44444444-4444-4444-4444-000000000009', 'Capucha',           'Capucha en todos sus colores',                     'cosmetic', 'hat',       'hood',        true),
  ('44444444-4444-4444-4444-000000000010', 'Barba Clásica',     'Barba clásica en todos sus colores',               'cosmetic', 'beard',     'classic',     true),
  ('44444444-4444-4444-4444-000000000011', 'Peto',              'Peto de guerrero en todos sus colores',            'cosmetic', 'clothes',   'breastplate', true),
  ('44444444-4444-4444-4444-000000000012', 'Sombrero Cowboy',   'Sombrero vaquero en todos sus colores',            'cosmetic', 'hat',       'cowboy',      true),
  -- Bin-type achievements
  ('44444444-4444-4444-4444-000000000013', 'Chaleco',           'Chaleco en todos sus colores',                     'cosmetic', 'clothes',   'vest',        true),
  ('44444444-4444-4444-4444-000000000014', 'Casco Caballero',   'Casco de caballero en todos sus colores',          'cosmetic', 'hat',       'knight',      true),
  ('44444444-4444-4444-4444-000000000015', 'Barba Vikinga',     'Barba vikinga en todos sus colores',               'cosmetic', 'beard',     'viking',      true),
  ('44444444-4444-4444-4444-000000000016', 'Barba Horquilla',   'Barba de horquilla en todos sus colores',          'cosmetic', 'beard',     'fork',        true),
  -- Location achievements
  ('44444444-4444-4444-4444-000000000017', 'Gorro Explorador',  'Gorro de explorador ranger en todos sus colores',  'cosmetic', 'hat',       'ranger',      true),
  ('44444444-4444-4444-4444-000000000018', 'Armadura Bruta',    'Armadura de bruto en todos sus colores',           'cosmetic', 'clothes',   'brute',       true),
  ('44444444-4444-4444-4444-000000000019', 'Fedora',            'Sombrero fedora en todos sus colores',             'cosmetic', 'hat',       'fedora',      true),
  -- Streak achievements
  ('44444444-4444-4444-4444-000000000020', 'Bigote Cowboy',     'Bigote estilo cowboy en todos sus colores',        'cosmetic', 'moustache', 'cowboy',      true),
  ('44444444-4444-4444-4444-000000000021', 'Barba Leñador',     'Barba de leñador en todos sus colores',            'cosmetic', 'beard',     'lumberjack',  true),
  -- Behavioral achievements
  ('44444444-4444-4444-4444-000000000022', 'Bigote Herradura',  'Bigote de herradura en todos sus colores',         'cosmetic', 'moustache', 'horseshoe',   true),
  ('44444444-4444-4444-4444-000000000023', 'Barba Chamán',      'Barba de chamán en todos sus colores',             'cosmetic', 'beard',     'shaman',      true),
  -- Social achievements
  ('44444444-4444-4444-4444-000000000024', 'Bigote Húngaro',    'Bigote estilo húngaro en todos sus colores',       'cosmetic', 'moustache', 'hungarian',   true),
  ('44444444-4444-4444-4444-000000000025', 'Barba Vikinga Dorada','Barba vikinga dorada en todos sus colores',      'cosmetic', 'beard',     'garibaldi',   true)
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  reward_type = EXCLUDED.reward_type,
  item_type   = EXCLUDED.item_type,
  item_key    = EXCLUDED.item_key,
  is_active   = EXCLUDED.is_active;

-- ── Step 3: Seed starter cosmetics (granted to every user on account creation) ─
-- UUIDs: 44444444-4444-4444-4444-000000000101 .. 000000000120
-- Starters: 1 hat (bandana), all 18 hair styles (hair is free), 1 beard (goatee), 1 moustache (pencil)
INSERT INTO public.rewards (id, name, description, reward_type, item_type, item_key, is_active)
VALUES
  ('44444444-4444-4444-4444-000000000101', 'Bandana (inicial)',        'Bandana disponible desde el comienzo',           'cosmetic_starter', 'hat',       'bandana',      true),
  ('44444444-4444-4444-4444-000000000102', 'Pelo Corto (inicial)',     'Pelo corto inicial',                             'cosmetic_starter', 'hair',      'short',        true),
  ('44444444-4444-4444-4444-000000000103', 'Pelo Largo (inicial)',     'Pelo largo inicial',                             'cosmetic_starter', 'hair',      'long',         true),
  ('44444444-4444-4444-4444-000000000104', 'Pelo Afro (inicial)',      'Pelo afro inicial',                              'cosmetic_starter', 'hair',      'afro',         true),
  ('44444444-4444-4444-4444-000000000105', 'Pelo Bob (inicial)',       'Pelo bob inicial',                               'cosmetic_starter', 'hair',      'bobcut',       true),
  ('44444444-4444-4444-4444-000000000106', 'Pelo Lazo (inicial)',      'Pelo con lazo inicial',                          'cosmetic_starter', 'hair',      'bow',          true),
  ('44444444-4444-4444-4444-000000000107', 'Doble Lazo (inicial)',     'Pelo con doble lazo inicial',                    'cosmetic_starter', 'hair',      'bows',         true),
  ('44444444-4444-4444-4444-000000000108', 'Pelo Pompas (inicial)',    'Pelo pompas inicial',                            'cosmetic_starter', 'hair',      'bubbles',      true),
  ('44444444-4444-4444-4444-000000000109', 'Pelo D-Cut (inicial)',     'Pelo d-cut inicial',                             'cosmetic_starter', 'hair',      'dcut',         true),
  ('44444444-4444-4444-4444-000000000110', 'Pelo Raya Media (inicial)','Pelo raya al medio inicial',                     'cosmetic_starter', 'hair',      'middle_part',  true),
  ('44444444-4444-4444-4444-000000000111', 'Mohawk (inicial)',         'Mohawk inicial',                                 'cosmetic_starter', 'hair',      'mohawk',       true),
  ('44444444-4444-4444-4444-000000000112', 'Cola de Caballo (inicial)','Cola de caballo inicial',                        'cosmetic_starter', 'hair',      'ponytail',     true),
  ('44444444-4444-4444-4444-000000000113', 'Pelo con Puntas (inicial)','Pelo con puntas inicial',                        'cosmetic_starter', 'hair',      'spikes',       true),
  ('44444444-4444-4444-4444-000000000114', 'Pelo de Punta (inicial)', 'Pelo de punta inicial',                          'cosmetic_starter', 'hair',      'tip',          true),
  ('44444444-4444-4444-4444-000000000115', 'Peluquín (inicial)',       'Peluquín inicial',                               'cosmetic_starter', 'hair',      'toupee',       true),
  ('44444444-4444-4444-4444-000000000116', 'Pelo V-Cut (inicial)',     'Pelo v-cut inicial',                             'cosmetic_starter', 'hair',      'vcut',         true),
  ('44444444-4444-4444-4444-000000000117', 'Melena (inicial)',         'Melena inicial',                                 'cosmetic_starter', 'hair',      'mane',         true),
  ('44444444-4444-4444-4444-000000000118', 'Calvo (inicial)',          'Sin pelo — disponible desde el comienzo',        'cosmetic_starter', 'hair',      'bald',         true),
  ('44444444-4444-4444-4444-000000000119', 'Barba Perilla (inicial)',  'Barba de perilla inicial',                       'cosmetic_starter', 'beard',     'goatee',       true),
  ('44444444-4444-4444-4444-000000000120', 'Bigote Lápiz (inicial)',   'Bigote de lápiz inicial',                        'cosmetic_starter', 'moustache', 'pencil',       true)
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  reward_type = EXCLUDED.reward_type,
  item_type   = EXCLUDED.item_type,
  item_key    = EXCLUDED.item_key,
  is_active   = EXCLUDED.is_active;

-- ── Step 4: Link each achievement to its cosmetic reward ──────────────────────
-- primer-paso (first_recycling) → jubón/doublet
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000001'
  WHERE condition_type = 'first_recycling' AND reward_id IS NULL;

-- semana-verde (streak_days 7) → beanie
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000002'
  WHERE condition_type = 'streak_days' AND condition_value = 7 AND reward_id IS NULL;

-- mes-eco (streak_days 30) → robe
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000003'
  WHERE condition_type = 'streak_days' AND condition_value = 30 AND reward_id IS NULL;

-- decena (total_recycling_count 10) → trapper
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000004'
  WHERE condition_type = 'total_recycling_count' AND condition_value = 10 AND reward_id IS NULL;

-- centurion (total_recycling_count 100) → tall hat
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000005'
  WHERE condition_type = 'total_recycling_count' AND condition_value = 100 AND reward_id IS NULL;

-- leyenda (total_recycling_count 500) → warrior helmet
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000006'
  WHERE condition_type = 'total_recycling_count' AND condition_value = 500 AND reward_id IS NULL;

-- cazador-pilas (waste_type_pilas_count 3) → engineer hat
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000007'
  WHERE condition_type = 'waste_type_pilas_count' AND condition_value = 3 AND reward_id IS NULL;

-- especialista-raee (waste_type_raee_count 3) → soldier helmet
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000008'
  WHERE condition_type = 'waste_type_raee_count' AND condition_value = 3 AND reward_id IS NULL;

-- vidriero (waste_type_vidrio_count 5) → hood
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000009'
  WHERE condition_type = 'waste_type_vidrio_count' AND condition_value = 5 AND reward_id IS NULL;

-- papelero (waste_type_paper_count 5) → classic beard
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000010'
  WHERE condition_type = 'waste_type_paper_count' AND condition_value = 5 AND reward_id IS NULL;

-- plastico-cero (waste_type_plastico_count 10) → breastplate
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000011'
  WHERE condition_type = 'waste_type_plastico_count' AND condition_value = 10 AND reward_id IS NULL;

-- todo-espectro (unique_waste_types 5) → cowboy hat
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000012'
  WHERE condition_type = 'unique_waste_types' AND condition_value = 5 AND reward_id IS NULL;

-- polimero-pro (bin_type_plastico_count 10) → vest
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000013'
  WHERE condition_type = 'bin_type_plastico_count' AND condition_value = 10 AND reward_id IS NULL;

-- el-separador (unique_bin_types 4) → knight helmet
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000014'
  WHERE condition_type = 'unique_bin_types' AND condition_value = 4 AND reward_id IS NULL;

-- residuos-peligrosos (bin_type_pilas_count 1) → viking beard
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000015'
  WHERE condition_type = 'bin_type_pilas_count' AND condition_value = 1 AND reward_id IS NULL;

-- ingeniero-electronico (bin_type_raee_count 3) → fork beard
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000016'
  WHERE condition_type = 'bin_type_raee_count' AND condition_value = 3 AND reward_id IS NULL;

-- explorador (unique_recycling_points 2) → ranger hat
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000017'
  WHERE condition_type = 'unique_recycling_points' AND condition_value = 2 AND reward_id IS NULL;

-- nomade-verde (unique_recycling_points 3) → brute armor
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000018'
  WHERE condition_type = 'unique_recycling_points' AND condition_value = 3 AND reward_id IS NULL;

-- bibliofilo (recycling_point_biblioteca_count 5) → fedora
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000019'
  WHERE condition_type = 'recycling_point_biblioteca_count' AND condition_value = 5 AND reward_id IS NULL;

-- racha-perfecta (best_streak_days 7) → cowboy moustache
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000020'
  WHERE condition_type = 'best_streak_days' AND condition_value = 7 AND reward_id IS NULL;

-- constancia-hierro (best_streak_days 30) → lumberjack beard
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000021'
  WHERE condition_type = 'best_streak_days' AND condition_value = 30 AND reward_id IS NULL;

-- corrector (waste_type_overridden_count 1) → horseshoe moustache
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000022'
  WHERE condition_type = 'waste_type_overridden_count' AND condition_value = 1 AND reward_id IS NULL;

-- meticuloso (manual_detection_count 5) → shaman beard
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000023'
  WHERE condition_type = 'manual_detection_count' AND condition_value = 5 AND reward_id IS NULL;

-- amigo-reciclador (friend_count 1) → hungarian moustache
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000024'
  WHERE condition_type = 'friend_count' AND condition_value = 1 AND reward_id IS NULL;

-- red-verde (friend_count 3) → garibaldi beard
UPDATE public.achievements SET reward_id = '44444444-4444-4444-4444-000000000025'
  WHERE condition_type = 'friend_count' AND condition_value = 3 AND reward_id IS NULL;

-- ── Step 5: Grant starter cosmetics to all existing users ─────────────────────
INSERT INTO public.user_rewards (user_id, reward_id, unlocked_at, is_equipped, is_active)
SELECT u.id, r.id, now(), false, true
FROM public.users u
CROSS JOIN public.rewards r
WHERE r.reward_type = 'cosmetic_starter' AND r.is_active = true
ON CONFLICT (user_id, reward_id) DO NOTHING;

-- ── Step 6: Update handle_new_user to grant starter cosmetics on signup ───────
CREATE OR REPLACE FUNCTION "app_auth"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  user_name text;
begin
  insert into public.users (id, email, last_login_at)
  values (new.id, new.email, now())
  on conflict (id) do update set
    last_login_at = case
      when new.last_sign_in_at is distinct from old.last_sign_in_at then clock_timestamp()
      else public.users.last_login_at
    end;

  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  insert into public.user_profiles (user_id, alias)
  values (new.id, user_name)
  on conflict (user_id) do nothing;

  -- Grant all starter cosmetics automatically
  insert into public.user_rewards (user_id, reward_id, unlocked_at, is_equipped, is_active)
  select new.id, r.id, now(), false, true
  from public.rewards r
  where r.reward_type = 'cosmetic_starter' and r.is_active = true
  on conflict (user_id, reward_id) do nothing;

  return new;
end;
$$;

-- ── Step 7: Replace check_and_unlock_achievements with reward-granting version ─
CREATE OR REPLACE FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid") RETURNS TABLE("achievement_id" "uuid", "achievement_name" "text", "reward_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  up              public.user_progress%ROWTYPE;
  recycling_count integer;
  unique_waste    integer;
  pilas_count     integer;
  raee_count      integer;
  vidrio_count    integer;
  paper_count     integer;
  plastico_count  integer;
  unique_bins     integer;
  bin_plastico    integer;
  bin_raee        integer;
  bin_pilas       integer;
  unique_points   integer;
  point_bib       integer;
  overridden_count integer;
  manual_count    integer;
  friend_count    integer;
  newly_unlocked  uuid[];

  PILAS_BIN_ID        uuid := '33333333-3333-3333-3333-000000000005';
  RAEE_BIN_ID         uuid := '33333333-3333-3333-3333-000000000006';
  PLASTIC_BIN_ID      uuid := '33333333-3333-3333-3333-000000000001';
  BIBLIOTECA_POINT_ID uuid := '22222222-2222-2222-2222-000000000001';
  PILAS_WASTE_ID      uuid := '11111111-1111-1111-1111-000000000005';
  RAEE_WASTE_ID       uuid := '11111111-1111-1111-1111-000000000006';
  VIDRIO_WASTE_ID     uuid := '11111111-1111-1111-1111-000000000004';
  PAPEL_WASTE_ID      uuid := '11111111-1111-1111-1111-000000000009';
  CARTON_WASTE_ID     uuid := '11111111-1111-1111-1111-000000000001';
  PET_WASTE_ID        uuid := '11111111-1111-1111-1111-000000000002';
  OTROS_PLASTIC_ID    uuid := '11111111-1111-1111-1111-000000000007';
BEGIN
  SELECT * INTO up FROM public.user_progress WHERE user_id = p_user_id AND is_active = true;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COUNT(*) INTO recycling_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(DISTINCT waste_type_id) INTO unique_waste FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO pilas_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = PILAS_WASTE_ID;
  SELECT COUNT(*) INTO raee_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = RAEE_WASTE_ID;
  SELECT COUNT(*) INTO vidrio_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id = VIDRIO_WASTE_ID;
  SELECT COUNT(*) INTO paper_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id IN (PAPEL_WASTE_ID, CARTON_WASTE_ID);
  SELECT COUNT(*) INTO plastico_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND waste_type_id IN (PET_WASTE_ID, OTROS_PLASTIC_ID);
  SELECT COUNT(DISTINCT bin_type_id) INTO unique_bins FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO bin_plastico FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = PLASTIC_BIN_ID;
  SELECT COUNT(*) INTO bin_raee FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = RAEE_BIN_ID;
  SELECT COUNT(*) INTO bin_pilas FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND bin_type_id = PILAS_BIN_ID;
  SELECT COUNT(DISTINCT recycling_point_id) INTO unique_points FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed';
  SELECT COUNT(*) INTO point_bib FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND recycling_point_id = BIBLIOTECA_POINT_ID;
  SELECT COUNT(*) INTO overridden_count FROM public.recycling_sessions WHERE user_id = p_user_id AND waste_type_overridden = true AND outcome = 'confirmed';
  SELECT COUNT(*) INTO manual_count FROM public.recycling_records WHERE user_id = p_user_id AND status = 'confirmed' AND detection_type = 'manual';
  SELECT COUNT(*) INTO friend_count FROM public.friendships WHERE (requester_id = p_user_id OR addressee_id = p_user_id) AND status = 'accepted' AND is_active = true;

  IF recycling_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'first_recycling' AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'first_recycling' AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.streak_days >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'streak_days' AND condition_value = 7 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'streak_days' AND a.condition_value = 7 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.streak_days >= 30 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'streak_days' AND condition_value = 30 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'streak_days' AND a.condition_value = 30 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.best_streak_days >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'best_streak_days' AND condition_value = 7 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'best_streak_days' AND a.condition_value = 7 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF up.best_streak_days >= 30 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'best_streak_days' AND condition_value = 30 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'best_streak_days' AND a.condition_value = 30 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'total_recycling_count' AND condition_value = 10 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 100 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'total_recycling_count' AND condition_value = 100 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 100 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF recycling_count >= 500 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'total_recycling_count' AND condition_value = 500 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'total_recycling_count' AND a.condition_value = 500 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_waste >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'unique_waste_types' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_waste_types' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF pilas_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_pilas_count' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_pilas_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF raee_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_raee_count' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_raee_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF vidrio_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_vidrio_count' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_vidrio_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF paper_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_paper_count' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_paper_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF plastico_count >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_plastico_count' AND condition_value = 10 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_plastico_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_bins >= 4 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'unique_bin_types' AND condition_value = 4 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_bin_types' AND a.condition_value = 4 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_plastico >= 10 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'bin_type_plastico_count' AND condition_value = 10 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_plastico_count' AND a.condition_value = 10 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_raee >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'bin_type_raee_count' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_raee_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF bin_pilas >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'bin_type_pilas_count' AND condition_value = 1 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'bin_type_pilas_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_points >= 2 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'unique_recycling_points' AND condition_value = 2 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_recycling_points' AND a.condition_value = 2 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF unique_points >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'unique_recycling_points' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'unique_recycling_points' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF point_bib >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'recycling_point_biblioteca_count' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'recycling_point_biblioteca_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF overridden_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'waste_type_overridden_count' AND condition_value = 1 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'waste_type_overridden_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF manual_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'manual_detection_count' AND condition_value = 5 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'manual_detection_count' AND a.condition_value = 5 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF friend_count >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'friend_count' AND condition_value = 1 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'friend_count' AND a.condition_value = 1 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  IF friend_count >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at, is_active)
    SELECT p_user_id, id, now(), true FROM public.achievements WHERE condition_type = 'friend_count' AND condition_value = 3 AND is_active = true
      AND id NOT IN (SELECT achievement_id FROM public.user_achievements WHERE user_id = p_user_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    RETURN QUERY SELECT a.id, a.name, a.reward_id FROM public.achievements a JOIN public.user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id AND a.condition_type = 'friend_count' AND a.condition_value = 3 AND a.is_active = true AND ua.unlocked_at >= now() - interval '1 second';
  END IF;

  -- Grant user_rewards for every achievement unlocked in this invocation that has a reward_id
  SELECT array_agg(ua.achievement_id)
  INTO newly_unlocked
  FROM public.user_achievements ua
  WHERE ua.user_id = p_user_id AND ua.unlocked_at >= now() - interval '3 seconds';

  IF newly_unlocked IS NOT NULL THEN
    INSERT INTO public.user_rewards (user_id, reward_id, unlocked_at, is_equipped, is_active)
    SELECT p_user_id, a.reward_id, now(), false, true
    FROM public.achievements a
    WHERE a.id = ANY(newly_unlocked)
      AND a.reward_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.user_rewards ur
        WHERE ur.user_id = p_user_id AND ur.reward_id = a.reward_id
      );
  END IF;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO service_role;
