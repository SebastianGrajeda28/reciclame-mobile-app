-- Public education RPC contracts.

CREATE OR REPLACE FUNCTION "public"."get_educational_categories"() RETURNS TABLE("category" "text", "content_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select 
    ec.category,
    count(*)::int as content_count
  from public.educational_content ec
  where ec.is_active = true
  group by ec.category
  order by ec.category;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_educational_content_by_category"("p_category" "text") RETURNS TABLE("id" "uuid", "category" "text", "title" "text", "description" "text", "content_type" "text", "body" "text", "image_url" "text", "waste_type_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true 
    and ec.category = p_category
  order by ec.display_order, ec.created_at;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_educational_content_for_sync"() RETURNS TABLE("id" "uuid", "category" "text", "title" "text", "description" "text", "content_type" "text", "body" "text", "image_url" "text", "waste_type_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true
  order by ec.category, ec.display_order, ec.created_at;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."test_educational_content_fetch"() RETURNS TABLE("content_fetched" boolean, "categories_found" integer, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  content_count int := 0;
  category_count int := 0;
  test_category text := 'test_recycling';
begin
  -- Insert test content
  insert into public.educational_content (category, title, content_type, body, is_active)
  values 
    (test_category, 'Test Fact 1', 'fact', 'Test body 1', true),
    (test_category, 'Test Fact 2', 'fact', 'Test body 2', true);

  -- Fetch all content
  select count(*)::int into content_count from public.get_educational_content_for_sync();

  -- Count categories
  select count(*)::int into category_count from public.get_educational_categories();

  -- Cleanup
  delete from public.educational_content where category = test_category;

  return query select 
    content_count > 0 as content_fetched,
    category_count,
    'test_completed';
end;
$$;

create or replace function app_education.get_educational_content_for_sync()
returns table(
  id uuid,
  category text,
  title text,
  description text,
  content_type text,
  body text,
  image_url text,
  waste_type_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true
  order by ec.category, ec.display_order, ec.created_at;
end;
$$;

create or replace function app_education.get_educational_content_by_category(p_category text)
returns table(
  id uuid,
  category text,
  title text,
  description text,
  content_type text,
  body text,
  image_url text,
  waste_type_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    ec.id,
    ec.category,
    ec.title,
    ec.description,
    ec.content_type,
    ec.body,
    ec.image_url,
    ec.waste_type_id
  from public.educational_content ec
  where ec.is_active = true 
    and ec.category = p_category
  order by ec.display_order, ec.created_at;
end;
$$;

create or replace function app_education.get_educational_categories()
returns table(category text, content_count int)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    ec.category,
    count(*)::int as content_count
  from public.educational_content ec
  where ec.is_active = true
  group by ec.category
  order by ec.category;
end;
$$;
