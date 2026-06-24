alter table public.bin_types
  add column image_url text,
  add column deposit_instruction text default 'Deposita en el contenedor correcto';
