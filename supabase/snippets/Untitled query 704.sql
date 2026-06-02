
-- 5. VERIFICACIÓN: Vemos si los valores aumentaron a 2
SELECT user_id, streak_days, heat, last_recycling_date 
FROM public.user_progress 
WHERE user_id = '88888888-8888-8888-8888-888888888888';