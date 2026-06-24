-- Fix achievement slugs to match their names consistently.
-- The original slugs were placeholder/codename values that diverged from the actual achievement names.

UPDATE public.achievements SET slug = 'bibliofilo'           WHERE slug = 'cartografo';
UPDATE public.achievements SET slug = 'constancia-hierro'    WHERE slug = 'racha-mensual';
UPDATE public.achievements SET slug = 'corrector'            WHERE slug = 'sin-excusas';
UPDATE public.achievements SET slug = 'el-separador'         WHERE slug = 'conquistador-bins';
UPDATE public.achievements SET slug = 'especialista-raee'    WHERE slug = 'guerrero-electronico';
UPDATE public.achievements SET slug = 'ingeniero-electronico' WHERE slug = 'campus-completo';
UPDATE public.achievements SET slug = 'meticuloso'           WHERE slug = 'madrugador';
UPDATE public.achievements SET slug = 'nomade-verde'         WHERE slug = 'nomada';
UPDATE public.achievements SET slug = 'papelero'             WHERE slug = 'maestro-vidrio';
UPDATE public.achievements SET slug = 'plastico-cero'        WHERE slug = 'titan-metal';
UPDATE public.achievements SET slug = 'polimero-pro'         WHERE slug = 'explorador-bins';
UPDATE public.achievements SET slug = 'responsable'          WHERE slug = 'maestro-bins';
UPDATE public.achievements SET slug = 'racha-perfecta'       WHERE slug = 'racha-semanal';
UPDATE public.achievements SET slug = 'todo-espectro'        WHERE slug = 'vaquero-papel';
UPDATE public.achievements SET slug = 'vidriero'             WHERE slug = 'guardian-organico';
