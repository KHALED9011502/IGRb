-- Fix user_roles RLS policies to allow inserts and updates
-- The previous RLS policy was too restrictive

DROP POLICY IF EXISTS "User roles are readable by the user" ON user_roles;

CREATE POLICY "Users can insert their own role"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);