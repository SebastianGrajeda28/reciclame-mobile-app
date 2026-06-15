-- RLS Policies for Reciclame app
-- These policies allow authenticated users to read shared content
-- and manage their own recycling records.

-- Recycling points: all logged-in users can read
CREATE POLICY "lectura puntos usuarios logueados"
  ON recycling_points
  FOR SELECT
  TO authenticated
  USING (true);

-- Recycling point bins: all logged-in users can read
CREATE POLICY "lectura bins usuarios logueados"
  ON recycling_point_bins
  FOR SELECT
  TO authenticated
  USING (true);

-- Recycling records: users can only insert their own records
CREATE POLICY "insertar registros propios"
  ON recycling_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Recycling records: users can only read their own records
CREATE POLICY "leer registros propios"
  ON recycling_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
