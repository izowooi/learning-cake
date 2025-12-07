-- Quiz Results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES passages(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_passage_id ON quiz_results(passage_id);
CREATE INDEX idx_quiz_results_completed_at ON quiz_results(completed_at DESC);

-- Enable RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

