UPDATE public.user_progress 
SET last_recycling_date = (CURRENT_DATE - INTERVAL '1 day')::date 
WHERE user_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.recycling_records (user_id, status) 
VALUES ('22222222-2222-2222-2222-222222222222', 'completado');

SELECT 'DÍA 3' as etapa, streak_days, heat FROM public.user_progress WHERE user_id = '22222222-2222-2222-2222-222222222222';