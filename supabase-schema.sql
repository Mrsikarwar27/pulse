-- Pulse Music Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT,
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER DEFAULT 180,
  play_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist songs junction table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- Liked songs table
CREATE TABLE IF NOT EXISTS public.liked_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- Recently played table
CREATE TABLE IF NOT EXISTS public.recently_played (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('audio', 'audio', true),
  ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public audio access" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Public cover access" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Authenticated audio upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated cover upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Songs policies
CREATE POLICY "Songs are viewable by everyone" ON public.songs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert songs" ON public.songs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update songs" ON public.songs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete songs" ON public.songs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Playlists policies
CREATE POLICY "Public playlists are viewable by everyone" ON public.playlists
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON public.playlists
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own playlists" ON public.playlists
  FOR DELETE USING (user_id = auth.uid());

-- Playlist songs policies
CREATE POLICY "Playlist songs are viewable by everyone" ON public.playlist_songs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert playlist songs" ON public.playlist_songs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete playlist songs" ON public.playlist_songs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Liked songs policies
CREATE POLICY "Users can view own liked songs" ON public.liked_songs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own liked songs" ON public.liked_songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own liked songs" ON public.liked_songs
  FOR DELETE USING (auth.uid() = user_id);

-- Recently played policies
CREATE POLICY "Users can view own recently played" ON public.recently_played
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recently played" ON public.recently_played
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recently played" ON public.recently_played
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment likes count
CREATE OR REPLACE FUNCTION public.increment_song_likes(song_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.songs 
  SET likes_count = COALESCE(likes_count, 0) + 1 
  WHERE id = song_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION public.decrement_song_likes(song_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.songs 
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
  WHERE id = song_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample songs (royalty-free placeholders)
INSERT INTO public.songs (title, artist, genre, cover_url, audio_url, duration, play_count, likes_count) VALUES
('Summer Vibes', 'Chill Wave', 'Electronic', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 210, 150, 45),
('Night Drive', 'Neon Dreams', 'Synthwave', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 185, 89, 32),
('Ocean Breeze', 'Sea Tides', 'Ambient', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 240, 67, 28),
('Electric Soul', 'DJ Pulse', 'House', 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 195, 112, 51),
('Sunset Dreams', 'LoFi Beats', 'Chillhop', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 220, 203, 78),
('Midnight City', 'Urban Echo', 'Pop', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 175, 145, 62),
('Floating', 'Cloud Nine', 'Dream Pop', 'https://images.unsplash.com/photo-1446057032654-9d8885fef76d?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 265, 98, 41),
('Energy', 'Power Beat', 'EDM', 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 200, 76, 33),
('Calm Waters', 'Zen Garden', 'Meditation', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 300, 54, 19),
('Dance Floor', 'Party Starters', 'Dance', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 188, 167, 73)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_title_artist ON public.songs(title, artist);
CREATE INDEX IF NOT EXISTS idx_liked_songs_user ON public.liked_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_played_user ON public.recently_played(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON public.playlist_songs(playlist_id);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.songs TO authenticated;
GRANT ALL ON public.playlists TO authenticated;
GRANT ALL ON public.playlist_songs TO authenticated;
GRANT ALL ON public.liked_songs TO authenticated;
GRANT ALL ON public.recently_played TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;