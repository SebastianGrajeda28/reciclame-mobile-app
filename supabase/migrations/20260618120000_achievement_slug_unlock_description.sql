-- Adds slug (stable client identifier) and unlock_description (post-unlock message)
-- to achievements. Existing description field remains as the locked hint/teaser.
-- Also updates check_and_unlock_achievements to return slug.

ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS slug               TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS unlock_description TEXT;

-- Seed slug and unlock_description for all 25 achievements
UPDATE public.achievements SET
  slug = 'primer-paso',
  unlock_description = 'Completaste tu primer reciclaje exitoso.'
WHERE name = 'Primer paso';

UPDATE public.achievements SET
  slug = 'semana-verde',
  unlock_description = 'Reciclaste durante 7 días consecutivos.'
WHERE name = 'Semana verde';

UPDATE public.achievements SET
  slug = 'mes-eco',
  unlock_description = 'Reciclaste durante 30 días consecutivos.'
WHERE name = 'Mes eco';

UPDATE public.achievements SET
  slug = 'decena',
  unlock_description = 'Reciclaste 10 artículos en total.'
WHERE name = 'Decena';

UPDATE public.achievements SET
  slug = 'centurion',
  unlock_description = 'Reciclaste 100 artículos en total.'
WHERE name = 'Centurión';

UPDATE public.achievements SET
  slug = 'leyenda',
  unlock_description = 'Reciclaste 500 artículos en total.'
WHERE name = 'Leyenda';

UPDATE public.achievements SET
  slug = 'cazador-pilas',
  unlock_description = 'Depositaste pilas en el contenedor correcto 3 veces.'
WHERE name = 'Cazador de pilas';

UPDATE public.achievements SET
  slug = 'especialista-raee',
  unlock_description = 'Depositaste residuos electrónicos (RAEE) 3 veces.'
WHERE name = 'Especialista RAEE';

UPDATE public.achievements SET
  slug = 'vidriero',
  unlock_description = 'Reciclaste vidrio 5 veces.'
WHERE name = 'Vidriero';

UPDATE public.achievements SET
  slug = 'papelero',
  unlock_description = 'Reciclaste papel o cartón 5 veces.'
WHERE name = 'Papelero';

UPDATE public.achievements SET
  slug = 'plastico-cero',
  unlock_description = 'Reciclaste plásticos 10 veces.'
WHERE name = 'Plástico cero';

UPDATE public.achievements SET
  slug = 'todo-espectro',
  unlock_description = 'Reciclaste al menos 5 tipos diferentes de residuos.'
WHERE name = 'Todo el espectro';

UPDATE public.achievements SET
  slug = 'polimero-pro',
  unlock_description = 'Usaste el contenedor de plásticos 10 veces.'
WHERE name = 'Polímero pro';

UPDATE public.achievements SET
  slug = 'el-separador',
  unlock_description = 'Usaste al menos 4 tipos distintos de contenedores.'
WHERE name = 'El separador';

UPDATE public.achievements SET
  slug = 'residuos-peligrosos',
  unlock_description = 'Depositaste correctamente un residuo peligroso (pilas o RAEE).'
WHERE name = 'Responsable';

UPDATE public.achievements SET
  slug = 'ingeniero-electronico',
  unlock_description = 'Depositaste residuos electrónicos en el contenedor RAEE 3 veces.'
WHERE name = 'Ingeniero electrónico';

UPDATE public.achievements SET
  slug = 'explorador',
  unlock_description = 'Reciclaste en al menos 2 puntos del campus.'
WHERE name = 'Explorador';

UPDATE public.achievements SET
  slug = 'nomade-verde',
  unlock_description = 'Reciclaste en todos los puntos de reciclaje del campus.'
WHERE name = 'Nómade verde';

UPDATE public.achievements SET
  slug = 'bibliofilo',
  unlock_description = 'Reciclaste 5 veces en la Biblioteca Central.'
WHERE name = 'Bibliófilo';

UPDATE public.achievements SET
  slug = 'racha-perfecta',
  unlock_description = 'Alcanzaste una racha de 7 días en algún momento.'
WHERE name = 'Racha perfecta';

UPDATE public.achievements SET
  slug = 'constancia-hierro',
  unlock_description = 'Alcanzaste una racha de 30 días en algún momento.'
WHERE name = 'Constancia de hierro';

UPDATE public.achievements SET
  slug = 'corrector',
  unlock_description = 'Corregiste la clasificación automática al menos una vez.'
WHERE name = 'Corrector';

UPDATE public.achievements SET
  slug = 'meticuloso',
  unlock_description = 'Registraste 5 reciclajes en modo manual.'
WHERE name = 'Meticuloso';

UPDATE public.achievements SET
  slug = 'amigo-reciclador',
  unlock_description = 'Agregaste a tu primer amigo en la app.'
WHERE name = 'Amigo reciclador';

UPDATE public.achievements SET
  slug = 'red-verde',
  unlock_description = 'Tienes al menos 3 amigos en la app.'
WHERE name = 'Red verde';

-- Also seed description (the hint/teaser shown while locked) for all 25
UPDATE public.achievements SET description = 'Todo gran camino empieza con un pequeño paso.'      WHERE slug = 'primer-paso';
UPDATE public.achievements SET description = 'La constancia transforma hábitos en estilo de vida.' WHERE slug = 'semana-verde';
UPDATE public.achievements SET description = 'Un mes entero sin romper la cadena.'                 WHERE slug = 'mes-eco';
UPDATE public.achievements SET description = 'El primer dígito doble lo cambia todo.'              WHERE slug = 'decena';
UPDATE public.achievements SET description = 'Hay un número redondo que pocos alcanzan.'           WHERE slug = 'centurion';
UPDATE public.achievements SET description = 'Solo los que van más allá conocen este camino.'      WHERE slug = 'leyenda';
UPDATE public.achievements SET description = 'Hay un residuo peligroso que muy pocos traen.'       WHERE slug = 'cazador-pilas';
UPDATE public.achievements SET description = 'Los residuos eléctricos necesitan manos expertas.'   WHERE slug = 'especialista-raee';
UPDATE public.achievements SET description = 'El vidrio nunca miente sobre quién lo separó bien.'  WHERE slug = 'vidriero';
UPDATE public.achievements SET description = 'Papel y cartón tienen más vida de la que parece.'    WHERE slug = 'papelero';
UPDATE public.achievements SET description = 'Un tipo de material domina más que los demás.'       WHERE slug = 'plastico-cero';
UPDATE public.achievements SET description = 'La variedad es la esencia del reciclaje completo.'   WHERE slug = 'todo-espectro';
UPDATE public.achievements SET description = 'Hay una familia de materiales que dominas.'          WHERE slug = 'polimero-pro';
UPDATE public.achievements SET description = 'Conoces el color de cada contenedor.'                WHERE slug = 'el-separador';
UPDATE public.achievements SET description = 'Algunos residuos requieren más cuidado que otros.'   WHERE slug = 'residuos-peligrosos';
UPDATE public.achievements SET description = 'La tecnología también tiene un ciclo de vida.'       WHERE slug = 'ingeniero-electronico';
UPDATE public.achievements SET description = 'El campus esconde más de un punto verde.'            WHERE slug = 'explorador';
UPDATE public.achievements SET description = 'Conoces cada rincón verde del campus.'               WHERE slug = 'nomade-verde';
UPDATE public.achievements SET description = 'Un lugar específico te conoce mejor que nadie.'      WHERE slug = 'bibliofilo';
UPDATE public.achievements SET description = 'El pasado también cuenta.'                           WHERE slug = 'racha-perfecta';
UPDATE public.achievements SET description = 'Tu mejor versión dejó huella.'                       WHERE slug = 'constancia-hierro';
UPDATE public.achievements SET description = 'La IA no siempre tiene la última palabra.'           WHERE slug = 'corrector';
UPDATE public.achievements SET description = 'Prefieres clasificar tú mismo.'                      WHERE slug = 'meticuloso';
UPDATE public.achievements SET description = 'El reciclaje es mejor en compañía.'                  WHERE slug = 'amigo-reciclador';
UPDATE public.achievements SET description = 'Has construido una comunidad eco.'                   WHERE slug = 'red-verde';

-- Replace check_and_unlock_achievements to return slug in addition to existing columns
-- Must DROP first because the return type changes (added achievement_slug column)
DROP FUNCTION IF EXISTS public.check_and_unlock_achievements(uuid);

CREATE OR REPLACE FUNCTION "public"."check_and_unlock_achievements"("p_user_id" "uuid")
  RETURNS TABLE("achievement_id" "uuid", "achievement_name" "text", "achievement_slug" "text", "reward_id" "uuid")
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public'
AS $$
DECLARE
  newly_unlocked uuid[];
BEGIN
  -- ── Progression achievements ───────────────────────────────────────────────
  -- primer-paso: first recycling record
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'primer-paso' AND a.is_active = true
    AND EXISTS (SELECT 1 FROM public.recycling_records rr WHERE rr.user_id = p_user_id AND rr.status = 'confirmed')
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- semana-verde: 7-day streak (current)
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'semana-verde' AND a.is_active = true
    AND EXISTS (SELECT 1 FROM public.user_progress up WHERE up.user_id = p_user_id AND up.streak_days >= 7)
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- mes-eco: 30-day streak (current)
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'mes-eco' AND a.is_active = true
    AND EXISTS (SELECT 1 FROM public.user_progress up WHERE up.user_id = p_user_id AND up.streak_days >= 30)
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- decena: 10 total records
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'decena' AND a.is_active = true
    AND (SELECT COUNT(*) FROM public.recycling_records rr WHERE rr.user_id = p_user_id AND rr.status = 'confirmed') >= 10
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- centurion: 100 total records
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'centurion' AND a.is_active = true
    AND (SELECT COUNT(*) FROM public.recycling_records rr WHERE rr.user_id = p_user_id AND rr.status = 'confirmed') >= 100
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- leyenda: 500 total records
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'leyenda' AND a.is_active = true
    AND (SELECT COUNT(*) FROM public.recycling_records rr WHERE rr.user_id = p_user_id AND rr.status = 'confirmed') >= 500
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- ── Waste-type achievements ────────────────────────────────────────────────
  -- cazador-pilas: 3x batteries (condition_type = 'waste_type_count', slug-based lookup via condition)
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'cazador-pilas' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      JOIN public.waste_types wt ON wt.id = rr.waste_type_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND lower(wt.name) LIKE '%pila%'
    ) >= 3
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- especialista-raee: 3x RAEE
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'especialista-raee' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      JOIN public.waste_types wt ON wt.id = rr.waste_type_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND lower(wt.name) LIKE '%raee%'
    ) >= 3
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- vidriero: 5x glass
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'vidriero' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      JOIN public.waste_types wt ON wt.id = rr.waste_type_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND lower(wt.name) LIKE '%vidrio%'
    ) >= 5
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- papelero: 5x paper/cardboard
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'papelero' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      JOIN public.waste_types wt ON wt.id = rr.waste_type_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND (lower(wt.name) LIKE '%papel%' OR lower(wt.name) LIKE '%cart%')
    ) >= 5
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- plastico-cero: 10x plastic
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'plastico-cero' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      JOIN public.waste_types wt ON wt.id = rr.waste_type_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND lower(wt.name) LIKE '%pl%stic%'
    ) >= 10
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- ── Bin-type / diversity achievements ─────────────────────────────────────
  -- todo-espectro: 5 distinct waste types
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'todo-espectro' AND a.is_active = true
    AND (
      SELECT COUNT(DISTINCT rr.waste_type_id) FROM public.recycling_records rr
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
    ) >= 5
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- polimero-pro: 10x plastic bin
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'polimero-pro' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      JOIN public.bin_types bt ON bt.id = rr.bin_type_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND lower(bt.name) LIKE '%pl%stic%'
    ) >= 10
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- el-separador: 4 distinct bin types
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'el-separador' AND a.is_active = true
    AND (
      SELECT COUNT(DISTINCT rr.bin_type_id) FROM public.recycling_records rr
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
    ) >= 4
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- residuos-peligrosos: 1x hazardous waste (pilas or RAEE)
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'residuos-peligrosos' AND a.is_active = true
    AND EXISTS (
      SELECT 1 FROM public.recycling_records rr
      JOIN public.waste_types wt ON wt.id = rr.waste_type_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND (lower(wt.name) LIKE '%pila%' OR lower(wt.name) LIKE '%raee%')
    )
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- ingeniero-electronico: 3x RAEE bin
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'ingeniero-electronico' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      JOIN public.bin_types bt ON bt.id = rr.bin_type_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND lower(bt.name) LIKE '%raee%'
    ) >= 3
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- ── Location achievements ──────────────────────────────────────────────────
  -- explorador: 2 distinct recycling points
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'explorador' AND a.is_active = true
    AND (
      SELECT COUNT(DISTINCT rr.recycling_point_id) FROM public.recycling_records rr
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
    ) >= 2
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- nomade-verde: all active recycling points visited
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'nomade-verde' AND a.is_active = true
    AND (
      SELECT COUNT(DISTINCT rr.recycling_point_id) FROM public.recycling_records rr
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
    ) >= (SELECT COUNT(*) FROM public.recycling_points WHERE is_active = true)
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- bibliofilo: 5x at Biblioteca Central
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'bibliofilo' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      JOIN public.recycling_points rp ON rp.id = rr.recycling_point_id
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND lower(rp.name) LIKE '%biblioteca%'
    ) >= 5
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- ── Streak achievements ────────────────────────────────────────────────────
  -- racha-perfecta: best_streak_days >= 7
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'racha-perfecta' AND a.is_active = true
    AND EXISTS (SELECT 1 FROM public.user_progress up WHERE up.user_id = p_user_id AND up.best_streak_days >= 7)
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- constancia-hierro: best_streak_days >= 30
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'constancia-hierro' AND a.is_active = true
    AND EXISTS (SELECT 1 FROM public.user_progress up WHERE up.user_id = p_user_id AND up.best_streak_days >= 30)
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- ── Behavioral achievements ────────────────────────────────────────────────
  -- corrector: corrected AI classification at least once
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'corrector' AND a.is_active = true
    AND EXISTS (
      SELECT 1 FROM public.recycling_records rr
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND rr.detection_type = 'manual'
        AND rr.confidence_score IS NOT NULL
    )
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- meticuloso: 5x manual mode
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'meticuloso' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.recycling_records rr
      WHERE rr.user_id = p_user_id AND rr.status = 'confirmed'
        AND rr.detection_type = 'manual'
    ) >= 5
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- ── Social achievements ────────────────────────────────────────────────────
  -- amigo-reciclador: 1 friend
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'amigo-reciclador' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.friendships f
      WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id) AND f.status = 'accepted'
    ) >= 1
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- red-verde: 3 friends
  INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
  SELECT p_user_id, a.id, now()
  FROM public.achievements a
  WHERE a.slug = 'red-verde' AND a.is_active = true
    AND (
      SELECT COUNT(*) FROM public.friendships f
      WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id) AND f.status = 'accepted'
    ) >= 3
    AND NOT EXISTS (SELECT 1 FROM public.user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  ON CONFLICT DO NOTHING;

  -- ── Grant cosmetic rewards for newly unlocked achievements ─────────────────
  SELECT array_agg(ua.achievement_id) INTO newly_unlocked
  FROM public.user_achievements ua
  WHERE ua.user_id = p_user_id AND ua.unlocked_at >= now() - interval '3 seconds';

  IF newly_unlocked IS NOT NULL THEN
    INSERT INTO public.user_rewards (user_id, reward_id, unlocked_at, is_equipped, is_active)
    SELECT p_user_id, a.reward_id, now(), false, true
    FROM public.achievements a
    WHERE a.id = ANY(newly_unlocked) AND a.reward_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.user_rewards ur
        WHERE ur.user_id = p_user_id AND ur.reward_id = a.reward_id
      );
  END IF;

  -- ── Return newly unlocked achievements ────────────────────────────────────
  RETURN QUERY
  SELECT a.id, a.name, a.slug, a.reward_id
  FROM public.achievements a
  WHERE a.id = ANY(newly_unlocked) AND a.slug IS NOT NULL;
END;
$$;
