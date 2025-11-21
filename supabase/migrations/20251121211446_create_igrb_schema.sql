-- IGRb Gaming Community Platform Schema
--
-- 1. New Tables
--    - profiles: User profiles with XP, level, and language preference
--    - games: Game catalog with multilingual support
--    - wiki_articles: Wiki content for games
--    - posts: Community posts
--    - reviews: Game reviews with ratings
--    - comments: Comments on posts
--    - badges: Achievement badges
--    - user_badges: User badge assignments
--
-- 2. Security
--    - Enable RLS on all tables
--    - Add policies for authenticated users

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text DEFAULT '',
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  preferred_language text DEFAULT 'ar',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  description_ar text DEFAULT '',
  description_en text DEFAULT '',
  banner_url text,
  thumbnail_url text,
  release_date date,
  developer text,
  platforms text[] DEFAULT '{}',
  average_rating numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games ON DELETE CASCADE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  slug text NOT NULL,
  content_ar text DEFAULT '',
  content_en text DEFAULT '',
  author_id uuid REFERENCES profiles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games ON DELETE CASCADE,
  author_id uuid REFERENCES profiles ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  language text DEFAULT 'ar',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games ON DELETE CASCADE,
  author_id uuid REFERENCES profiles ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  language text DEFAULT 'ar',
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts ON DELETE CASCADE,
  author_id uuid REFERENCES profiles ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text DEFAULT '',
  description_en text DEFAULT '',
  icon text
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  badge_id uuid REFERENCES badges ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Games are viewable by everyone"
  ON games FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Wiki articles are viewable by everyone"
  ON wiki_articles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create wiki articles"
  ON wiki_articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their wiki articles"
  ON wiki_articles FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  TO authenticated, anon
  USING (true);