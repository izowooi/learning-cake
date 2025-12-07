-- Passages table
CREATE TABLE IF NOT EXISTS passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('humanities', 'social', 'science', 'culture', 'history', 'arts', 'general', 'random', 'custom')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('elementary', 'middle_low', 'middle_high', 'high_school', 'college')),
  length TEXT NOT NULL CHECK (length IN ('short', 'medium', 'long')),
  word_count INTEGER,
  audio_url_us TEXT,
  audio_url_uk TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_passages_user_id ON passages(user_id);
CREATE INDEX idx_passages_category ON passages(category);
CREATE INDEX idx_passages_difficulty ON passages(difficulty);
CREATE INDEX idx_passages_created_at ON passages(created_at DESC);

-- Enable RLS
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own passages" ON passages
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own passages" ON passages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passages" ON passages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passages" ON passages
  FOR DELETE USING (auth.uid() = user_id);

