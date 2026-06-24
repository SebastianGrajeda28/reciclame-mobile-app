-- Seeds all cosmetic items for every avatar category into rewards.
-- Categories: race, bg, ears, eyes, nose, mouth, brows, hair, hat, clothes, beard, moustache
-- All items are free (requires_unlock = false) except the 25 already seeded with achievement links.

-- ── Raza (race) ───────────────────────────────────────────────────────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Humano',   'race', 'human',    false, true),
  ('Elfo',     'race', 'elf',      false, true),
  ('Enano',    'race', 'dwarf',    false, true),
  ('Orco',     'race', 'orc',      false, true),
  ('Goblin',   'race', 'goblin',   false, true),
  ('Halfling', 'race', 'halfling', false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Fondo (bg) ────────────────────────────────────────────────────────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Fondo Azul',       'bg', 'blue',      false, true),
  ('Fondo Verde',      'bg', 'green',     false, true),
  ('Fondo Khaki',      'bg', 'khaki',     false, true),
  ('Fondo Lima',       'bg', 'lime',      false, true),
  ('Fondo Marino',     'bg', 'marine',    false, true),
  ('Fondo Rosa',       'bg', 'pink',      false, true),
  ('Fondo Morado',     'bg', 'purple',    false, true),
  ('Fondo Rojo',       'bg', 'red',       false, true),
  ('Fondo Salmón',     'bg', 'salmon',    false, true),
  ('Fondo Cielo',      'bg', 'sky',       false, true),
  ('Fondo Turquesa',   'bg', 'turquoise', false, true),
  ('Fondo Violeta',    'bg', 'violet',    false, true),
  ('Fondo Amarillo',   'bg', 'yellow',    false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Orejas (ears) ────────────────────────────────────────────────────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Orejas Grandes',    'ears', 'big',         false, true),
  ('Orejas Mordidas',   'ears', 'bitten',      false, true),
  ('Orejas Mini',       'ears', 'mini',        false, true),
  ('Orejas Monje',      'ears', 'monk',        false, true),
  ('Orejas Simio',      'ears', 'monkey',      false, true),
  ('Orejas Normales',   'ears', 'normal',      false, true),
  ('Orejas Aplastadas', 'ears', 'pressed',     false, true),
  ('Orejas Salidas',    'ears', 'protruding',  false, true),
  ('Orejas Pequeñas',   'ears', 'small',       false, true),
  ('Orejas Altas',      'ears', 'tall',        false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Ojos (eyes) ───────────────────────────────────────────────────────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Ojos Enojados',     'eyes', 'angry',      false, true),
  ('Ojos Felices',      'eyes', 'happy',      false, true),
  ('Ojos Mini',         'eyes', 'mini',       false, true),
  ('Ojos Estrechos',    'eyes', 'narrow',     false, true),
  ('Ojos Pissed',       'eyes', 'pissed',     false, true),
  ('Ojos Redondos',     'eyes', 'round',      false, true),
  ('Ojos Tristes',      'eyes', 'sad',        false, true),
  ('Ojos Pequeños',     'eyes', 'small',      false, true),
  ('Ojos Suspicaces',   'eyes', 'suspicious', false, true),
  ('Ojos Altos',        'eyes', 'tall',       false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Nariz (nose) ─────────────────────────────────────────────────────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Nariz Bola',        'nose', 'ball',     false, true),
  ('Nariz Grande',      'nose', 'big',      false, true),
  ('Nariz Gorda',       'nose', 'fat',      false, true),
  ('Nariz Chata',       'nose', 'flat',     false, true),
  ('Nariz Mini',        'nose', 'mini',     false, true),
  ('Nariz Oink',        'nose', 'oink',     false, true),
  ('Nariz Puntiaguda',  'nose', 'pointy',   false, true),
  ('Nariz Redondeada',  'nose', 'rounded',  false, true),
  ('Nariz Pequeña',     'nose', 'small',    false, true),
  ('Nariz Recta',       'nose', 'straight', false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Boca (mouth) ─────────────────────────────────────────────────────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Boca Segura',       'mouth', 'confident', false, true),
  ('Boca Fruncida',     'mouth', 'frown',     false, true),
  ('Mueca',             'mouth', 'grimace',   false, true),
  ('Dientes Apretados', 'mouth', 'grit',      false, true),
  ('Boca Feliz',        'mouth', 'happy',     false, true),
  ('Carcajada',         'mouth', 'laugh',     false, true),
  ('Boca Neutral',      'mouth', 'neutral',   false, true),
  ('Boca Fruncida 2',   'mouth', 'pursed',    false, true),
  ('Boca Triste',       'mouth', 'sad',       false, true),
  ('Boca Pequeña',      'mouth', 'small',     false, true),
  ('Sonrisa',           'mouth', 'smile',     false, true),
  ('Boca Sorprendida',  'mouth', 'surprise',  false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Cejas (brows) ─────────────────────────────────────────────────────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Cejas Agresivas',   'brows', 'aggressive', false, true),
  ('Cejas Enojadas',    'brows', 'angry',      false, true),
  ('Cejas Seguras',     'brows', 'confident',  false, true),
  ('Cejas Despeinadas', 'brows', 'disheveled', false, true),
  ('Cejas Felices',     'brows', 'happy',      false, true),
  ('Cejas Inocentes',   'brows', 'innocent',   false, true),
  ('Cejas Agradables',  'brows', 'nice',       false, true),
  ('Cejas Normales',    'brows', 'normal',     false, true),
  ('Cejas Lastimosas',  'brows', 'pity',       false, true),
  ('Cejas Tristes',     'brows', 'sad',        false, true),
  ('Cejas Gruesas',     'brows', 'thick',      false, true),
  ('Monobrow',          'brows', 'unibrow',    false, true),
  ('Cejas Preocupadas', 'brows', 'worry',      false, true),
  ('Cejas Enrolladas',  'brows', 'wrapping',   false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Pelo — fill remaining styles (afro..vcut already seeded in 130000) ─────────
-- Re-insert with ON CONFLICT to be safe
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Pelo Afro',         'hair', 'afro',        false, true),
  ('Pelo Calvo',        'hair', 'bald',        false, true),
  ('Pelo Bob',          'hair', 'bobcut',      false, true),
  ('Pelo Lazo',         'hair', 'bow',         false, true),
  ('Pelo Lazos',        'hair', 'bows',        false, true),
  ('Pelo Burbujas',     'hair', 'bubbles',     false, true),
  ('Pelo Dcut',         'hair', 'dcut',        false, true),
  ('Pelo Largo',        'hair', 'long',        false, true),
  ('Pelo Melena',       'hair', 'mane',        false, true),
  ('Pelo Raya',         'hair', 'middle_part', false, true),
  ('Pelo Mohawk',       'hair', 'mohawk',      false, true),
  ('Pelo Cola',         'hair', 'ponytail',    false, true),
  ('Pelo Corto',        'hair', 'short',       false, true),
  ('Pelo Picos',        'hair', 'spikes',      false, true),
  ('Pelo Punta',        'hair', 'tip',         false, true),
  ('Pelo Tupé',         'hair', 'toupee',      false, true),
  ('Pelo Vcut',         'hair', 'vcut',        false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Gorro — bandana (free, rest already seeded as achievement rewards) ─────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Bandana', 'hat', 'bandana', false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Barba — free styles (goatee + the 7 not achievement-linked) ──────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Barba Candado',     'beard', 'goatee',    false, true),
  ('Barba Trenzada',    'beard', 'braided',   false, true),
  ('Barba Patillas',    'beard', 'chops',     false, true),
  ('Barba Cortina',     'beard', 'curtain',   false, true),
  ('Barba Holandesa',   'beard', 'dutch',     false, true),
  ('Barba Egipcia',     'beard', 'egyptian',  false, true),
  ('Barba Larga',       'beard', 'long',      false, true),
  ('Barba Tubo',        'beard', 'shaft',     false, true),
  ('Barba Patilla',     'beard', 'sideburns', false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Bigote — free styles (pencil + 8 not achievement-linked) ─────────────────
INSERT INTO public.rewards (name, item_type, item_key, requires_unlock, is_active)
VALUES
  ('Bigote Lápiz',      'moustache', 'pencil',     false, true),
  ('Bigote Bandido',    'moustache', 'bandit',      false, true),
  ('Bigote Dalí',       'moustache', 'dali',        false, true),
  ('Bigote Dallas',     'moustache', 'dallas',      false, true),
  ('Bigote Anciano',    'moustache', 'elder',       false, true),
  ('Bigote Moebius',    'moustache', 'moebius',     false, true),
  ('Bigote Profesor',   'moustache', 'professor',   false, true),
  ('Bigote Cepillo',    'moustache', 'toothbrush',  false, true),
  ('Bigote Zorro',      'moustache', 'zorro',       false, true)
ON CONFLICT (item_type, item_key) DO UPDATE SET
  requires_unlock = EXCLUDED.requires_unlock,
  is_active       = EXCLUDED.is_active;

-- ── Update save_avatar_config to validate ALL categories ─────────────────────
-- The previous version only validated hat/clothes/hair/beard/moustache.
-- This version validates every field in AvatarConfig.

DROP FUNCTION IF EXISTS public.save_avatar_config(uuid, jsonb);

CREATE OR REPLACE FUNCTION "public"."save_avatar_config"("p_user_id" "uuid", "p_config" "jsonb")
  RETURNS TABLE("success" boolean, "message" "text")
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public'
AS $$
DECLARE
  -- Style keys (last underscore segment for compound color_style values)
  hat_key       text;
  clothes_key   text;
  hair_key      text;
  beard_key     text;
  moustache_key text;

  -- Simple keys (no color prefix, stored as-is)
  race_key      text := p_config->>'race';
  bg_key        text := p_config->>'bg';
  ears_key      text := p_config->>'ears';
  eyes_key      text := p_config->>'eyeStyle';
  nose_key      text := p_config->>'nose';
  mouth_key     text := p_config->>'mouth';
  brows_key     text;

  invalid_items text[] := '{}';
  locked_items  text[] := '{}';

  r             RECORD;
BEGIN
  -- Extract style from compound "color_style" values (last segment after final underscore)
  hat_key       := CASE WHEN p_config->>'hat'       IS NOT NULL THEN reverse(split_part(reverse(p_config->>'hat'),       '_', 1)) ELSE NULL END;
  clothes_key   := CASE WHEN p_config->>'clothes'   IS NOT NULL THEN reverse(split_part(reverse(p_config->>'clothes'),   '_', 1)) ELSE NULL END;
  hair_key      := CASE WHEN p_config->>'hair'      IS NOT NULL THEN reverse(split_part(reverse(p_config->>'hair'),      '_', 1)) ELSE NULL END;
  beard_key     := CASE WHEN p_config->>'beard'     IS NOT NULL THEN reverse(split_part(reverse(p_config->>'beard'),     '_', 1)) ELSE NULL END;
  moustache_key := CASE WHEN p_config->>'moustache' IS NOT NULL THEN reverse(split_part(reverse(p_config->>'moustache'), '_', 1)) ELSE NULL END;
  -- Brows: "color_style" → style is everything after the first underscore (e.g. "black_unibrow" → "unibrow")
  brows_key     := CASE WHEN p_config->>'brows'     IS NOT NULL THEN regexp_replace(p_config->>'brows', '^[^_]+_', '') ELSE NULL END;

  -- bg: strip "light_" prefix to get color key
  bg_key        := regexp_replace(COALESCE(p_config->>'bg', ''), '^light_', '');

  -- ── Validate required simple categories ──────────────────────────────────
  IF race_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'race' AND item_key = race_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'race:' || race_key);
  END IF;

  IF bg_key IS NOT NULL AND bg_key <> '' AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'bg' AND item_key = bg_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'bg:' || bg_key);
  END IF;

  IF ears_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'ears' AND item_key = ears_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'ears:' || ears_key);
  END IF;

  IF eyes_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'eyes' AND item_key = eyes_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'eyes:' || eyes_key);
  END IF;

  IF nose_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'nose' AND item_key = nose_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'nose:' || nose_key);
  END IF;

  IF mouth_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'mouth' AND item_key = mouth_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'mouth:' || mouth_key);
  END IF;

  IF brows_key IS NOT NULL AND brows_key <> '' AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'brows' AND item_key = brows_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'brows:' || brows_key);
  END IF;

  -- ── Validate nullable compound categories (hat/clothes/hair/beard/moustache) ─
  IF hat_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'hat' AND item_key = hat_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'hat:' || hat_key);
  END IF;

  IF clothes_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'clothes' AND item_key = clothes_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'clothes:' || clothes_key);
  END IF;

  IF hair_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'hair' AND item_key = hair_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'hair:' || hair_key);
  END IF;

  IF beard_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'beard' AND item_key = beard_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'beard:' || beard_key);
  END IF;

  IF moustache_key IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rewards WHERE item_type = 'moustache' AND item_key = moustache_key AND is_active = true
  ) THEN
    invalid_items := array_append(invalid_items, 'moustache:' || moustache_key);
  END IF;

  IF array_length(invalid_items, 1) > 0 THEN
    RETURN QUERY SELECT false, 'cosmetics_invalid:' || array_to_string(invalid_items, ',');
    RETURN;
  END IF;

  -- ── Check achievement locks for items with requires_unlock = true ───────────
  FOR r IN
    SELECT item_type, item_key, requires_unlock, achievement_id
    FROM public.rewards
    WHERE is_active = true
      AND requires_unlock = true
      AND (
        (item_type = 'hat'       AND item_key = hat_key)       OR
        (item_type = 'clothes'   AND item_key = clothes_key)   OR
        (item_type = 'hair'      AND item_key = hair_key)      OR
        (item_type = 'beard'     AND item_key = beard_key)     OR
        (item_type = 'moustache' AND item_key = moustache_key)
      )
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      WHERE ua.user_id = p_user_id
        AND ua.achievement_id = r.achievement_id
        AND ua.is_active = true
    ) THEN
      locked_items := array_append(locked_items, r.item_type || ':' || r.item_key);
    END IF;
  END LOOP;

  IF array_length(locked_items, 1) > 0 THEN
    RETURN QUERY SELECT false, 'cosmetics_not_unlocked:' || array_to_string(locked_items, ',');
    RETURN;
  END IF;

  -- ── Save ──────────────────────────────────────────────────────────────────
  INSERT INTO public.avatars (user_id, avatar_config, updated_at)
  VALUES (p_user_id, p_config, now())
  ON CONFLICT (user_id) DO UPDATE SET
    avatar_config = EXCLUDED.avatar_config,
    updated_at    = now();

  RETURN QUERY SELECT true, 'avatar_saved';
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO service_role;
