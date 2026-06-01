create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_name text;
begin
  -- 1. Insert user into public.users table
  insert into public.users (id, email, last_login_at)
  values (new.id, new.email, now())
  on conflict (id) do update set
    last_login_at = coalesce(new.last_sign_in_at, public.users.last_login_at);
  
  -- 2. Extract display name from Google OAuth metadata
  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  -- 3. Insert user profile into public.user_profiles table
  insert into public.user_profiles (user_id, alias)
  values (new.id, user_name)
  on conflict (user_id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert or update on auth.users
for each row execute procedure public.handle_new_user();
