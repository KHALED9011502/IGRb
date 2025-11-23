-- Ensure user_roles table has proper default values
-- Add default values for columns if they don't exist

ALTER TABLE user_roles ALTER COLUMN is_admin SET DEFAULT false;
ALTER TABLE user_roles ALTER COLUMN can_post SET DEFAULT false;

-- Add updated_at default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_roles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;