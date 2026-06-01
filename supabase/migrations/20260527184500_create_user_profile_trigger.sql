-- Update the handle_new_user function to automatically create a user profile using Google metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_name text;
begin
  -- 1. Insert user into public.users table
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  
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
