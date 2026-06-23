CREATE INDEX IF NOT EXISTS idx_user_roles_active_user_id
  ON public.user_roles USING btree (user_id)
  WHERE (is_active = true);
