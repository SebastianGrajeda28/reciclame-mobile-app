-- 1. Creamos la función blindada contra duplicados
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing; -- <--- Esta es la línea mágica protectora
  
  return new;
end;
$$;

-- 2. El trigger se queda exactamente igual
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();