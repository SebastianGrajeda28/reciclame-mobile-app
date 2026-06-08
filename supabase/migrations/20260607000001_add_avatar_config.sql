-- Agrega soporte para config de avatar compuesto (capas de pixel art).
-- avatar_config almacena el JSON de AvatarConfig (raza, piel, ojos, pelo, etc.)
-- Formato actual: strings compuestos "color_estilo" (ej: "brown_leather_cowboy").
-- El catálogo de ítems válidos vive en el frontend (avatarCatalog.ts).
--
-- TODO(#79): cuando se implemente el sistema de desbloqueo de cosméticos:
--   1. Agregar a `rewards`: item_key TEXT, item_type TEXT
--      para relacionar cada recompensa con un ítem del catálogo.
--   2. Crear tabla `user_cosmetic_colors(user_id, item_key, color)`
--      para persistir el color elegido por usuario por ítem (hoy vive en AsyncStorage).
--   3. Validar en save/equip que avatar_config solo contenga ítems
--      presentes en user_rewards del usuario.
--   4. Migrar avatar_config a referencias por item_key en lugar de strings compuestos.
ALTER TABLE public.avatars
  ADD COLUMN IF NOT EXISTS avatar_config jsonb;
