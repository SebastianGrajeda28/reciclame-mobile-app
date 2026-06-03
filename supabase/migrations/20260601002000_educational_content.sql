-- Create table for categorized educational content
create table if not exists public.educational_content (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text,
  content_type text not null, -- 'fact', 'tip', 'guide', 'instruction'
  body text not null,
  image_url text,
  waste_type_id uuid references public.waste_types(id) on delete set null,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Index for efficient offline consumption queries
create index if not exists idx_educational_content_category_active 
  on public.educational_content(category, is_active) 
  where is_active = true;

-- RPC: Get all educational content for offline consumption
-- Returns content grouped by category, optimized for mobile sync
create or replace function public.get_educational_content_for_sync()
returns table(
  id uuid,
  category text,
  title text,
  description text,
  content_type text,
  body text,
  image_url text,
  waste_type_id uuid
) as $$
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
$$ language plpgsql security definer;

-- RPC: Get educational content by category
create or replace function public.get_educational_content_by_category(p_category text)
returns table(
  id uuid,
  category text,
  title text,
  description text,
  content_type text,
  body text,
  image_url text,
  waste_type_id uuid
) as $$
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
$$ language plpgsql security definer;

-- RPC: Get all available categories
create or replace function public.get_educational_categories()
returns table(category text, content_count int) as $$
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
$$ language plpgsql security definer;

-- Test RPC: Test educational content fetch
create or replace function public.test_educational_content_fetch()
returns table(content_fetched boolean, categories_found int, message text) as $$
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
$$ language plpgsql security definer;
