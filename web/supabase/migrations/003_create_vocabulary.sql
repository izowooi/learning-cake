-- Vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,
  word TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT,
  definition TEXT,
  definition_korean TEXT,
  english_definition TEXT,
  examples JSONB DEFAULT '[]'::jsonb,
  context_sentence TEXT,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX idx_vocabulary_word ON vocabulary(word);
CREATE INDEX idx_vocabulary_mastery ON vocabulary(user_id, mastery_level);

-- Unique constraint to prevent duplicate words per user
CREATE UNIQUE INDEX idx_vocabulary_user_word ON vocabulary(user_id, lower(word));

-- Enable RLS
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own vocabulary" ON vocabulary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary" ON vocabulary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary" ON vocabulary
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary" ON vocabulary
  FOR DELETE USING (auth.uid() = user_id);

