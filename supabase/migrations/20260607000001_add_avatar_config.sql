-- Agrega soporte para config de avatar compuesto (capas de pixel art).
-- avatar_config almacena el JSON de AvatarConfig (raza, piel, ojos, pelo, etc.)
ALTER TABLE public.avatars
  ADD COLUMN IF NOT EXISTS avatar_config jsonb;
