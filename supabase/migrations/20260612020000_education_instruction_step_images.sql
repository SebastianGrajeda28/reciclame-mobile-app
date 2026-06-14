alter table public.instruction_steps
  add column if not exists image_url text;
