import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  bio: string;
  xp: number;
  level: number;
  preferred_language: string;
  created_at: string;
};

export type Game = {
  id: string;
  title_ar: string;
  title_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  banner_url?: string;
  thumbnail_url?: string;
  release_date?: string;
  developer?: string;
  platforms: string[];
  average_rating: number;
  total_ratings: number;
  created_at: string;
};

export type Post = {
  id: string;
  game_id?: string;
  author_id: string;
  title: string;
  content: string;
  language: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: Profile;
  game?: Game;
};

export type Review = {
  id: string;
  game_id: string;
  author_id: string;
  rating: number;
  title: string;
  content: string;
  language: string;
  helpful_count: number;
  created_at: string;
  author?: Profile;
  game?: Game;
};

export type WikiArticle = {
  id: string;
  game_id?: string;
  title_ar: string;
  title_en: string;
  slug: string;
  content_ar: string;
  content_en: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  game?: Game;
};