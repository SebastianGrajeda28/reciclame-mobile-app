-- supabase/migrations/20260522000003_create_rpc_count_tables.sql
CREATE OR REPLACE FUNCTION count_public_tables()
RETURNS TABLE(table_name text) AS $$
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
$$ LANGUAGE sql SECURITY DEFINER;