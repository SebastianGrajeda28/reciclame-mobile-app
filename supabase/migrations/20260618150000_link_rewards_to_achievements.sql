-- Links the 25 cosmetic rewards to their achievements and sets requires_unlock = true.
-- Corrects the failed UPDATE in 130000 (achievements.reward_id was already dropped
-- by 120000 when 130000 ran). Uses slugs set by 120000 as the join key.
-- Safe to run multiple times (idempotent UPDATEs).

UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'primer-paso'          AND r.item_type = 'clothes'   AND r.item_key = 'doublet';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'semana-verde'         AND r.item_type = 'hat'       AND r.item_key = 'beanie';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'mes-eco'              AND r.item_type = 'clothes'   AND r.item_key = 'robe';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'decena'               AND r.item_type = 'hat'       AND r.item_key = 'trapper';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'centurion'            AND r.item_type = 'hat'       AND r.item_key = 'tall';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'leyenda'              AND r.item_type = 'hat'       AND r.item_key = 'warrior';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'cazador-pilas'        AND r.item_type = 'hat'       AND r.item_key = 'engineer';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'guerrero-electronico'  AND r.item_type = 'hat'       AND r.item_key = 'soldier';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'guardian-organico'    AND r.item_type = 'hat'       AND r.item_key = 'hood';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'maestro-vidrio'       AND r.item_type = 'beard'     AND r.item_key = 'classic';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'titan-metal'          AND r.item_type = 'clothes'   AND r.item_key = 'breastplate';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'vaquero-papel'        AND r.item_type = 'hat'       AND r.item_key = 'cowboy';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'explorador-bins'      AND r.item_type = 'clothes'   AND r.item_key = 'vest';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'conquistador-bins'    AND r.item_type = 'hat'       AND r.item_key = 'knight';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'maestro-bins'         AND r.item_type = 'beard'     AND r.item_key = 'viking';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'campus-completo'      AND r.item_type = 'beard'     AND r.item_key = 'fork';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'explorador'           AND r.item_type = 'hat'       AND r.item_key = 'ranger';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'nomada'               AND r.item_type = 'clothes'   AND r.item_key = 'brute';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'cartografo'           AND r.item_type = 'hat'       AND r.item_key = 'fedora';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'racha-semanal'        AND r.item_type = 'moustache' AND r.item_key = 'cowboy';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'racha-mensual'        AND r.item_type = 'beard'     AND r.item_key = 'lumberjack';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'sin-excusas'          AND r.item_type = 'moustache' AND r.item_key = 'horseshoe';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'madrugador'           AND r.item_type = 'beard'     AND r.item_key = 'shaman';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'amigo-reciclador'     AND r.item_type = 'moustache' AND r.item_key = 'hungarian';
UPDATE public.rewards r SET achievement_id = a.id, requires_unlock = true FROM public.achievements a WHERE a.slug = 'red-verde'            AND r.item_type = 'beard'     AND r.item_key = 'garibaldi';
