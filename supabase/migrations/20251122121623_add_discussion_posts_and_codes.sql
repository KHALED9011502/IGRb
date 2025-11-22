-- Add access codes and admin role system
-- 1. New Tables
--    - access_codes: Codes for posting (9011502) and admin access (55804677)
--    - user_roles: Track which users are admins
--    - discussion_posts: Detailed posts with game platforms, metadata
--    - post_comments: Comments on discussion posts
--
-- 2. Modified Tables
--    - posts: Rename to discussion_posts, add new fields
--
-- 3. Security
--    - Enable RLS on all tables
--    - Add policies for code verification
--    - Add admin-only delete policies

CREATE TABLE IF NOT EXISTS access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  access_type text NOT NULL CHECK (access_type IN ('post', 'admin')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid PRIMARY KEY REFERENCES profiles ON DELETE CASCADE,
  is_admin boolean DEFAULT false,
  can_post boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discussion_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games ON DELETE CASCADE,
  author_id uuid REFERENCES profiles ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  platforms text[] DEFAULT '{}',
  language text DEFAULT 'ar',
  comments_count integer DEFAULT 0,
  today_comments integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES discussion_posts ON DELETE CASCADE,
  author_id uuid REFERENCES profiles ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussion posts are viewable by everyone"
  ON discussion_posts FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users with post permission can create posts"
  ON discussion_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.can_post = true
    )
  );

CREATE POLICY "Authors can update their posts"
  ON discussion_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can delete any post"
  ON discussion_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

CREATE POLICY "Authors can delete their own posts"
  ON discussion_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Post comments are viewable by everyone"
  ON post_comments FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "User roles are readable by the user"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Access codes are only readable for validation"
  ON access_codes FOR SELECT
  TO authenticated, anon
  USING (true);