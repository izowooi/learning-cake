-- Writings table
CREATE TABLE IF NOT EXISTS writings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES passages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_review JSONB,
  review_requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_writings_user_id ON writings(user_id);
CREATE INDEX idx_writings_passage_id ON writings(passage_id);
CREATE INDEX idx_writings_created_at ON writings(created_at DESC);

-- Enable RLS
ALTER TABLE writings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own writings" ON writings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writings" ON writings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writings" ON writings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own writings" ON writings
  FOR DELETE USING (auth.uid() = user_id);

