-- Achievements definition table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (name, name_ko, description, description_ko, icon, points, requirement_type, requirement_value) VALUES
('First Steps', '첫 걸음', 'Complete your first passage', '첫 번째 지문을 완료하세요', '🎯', 10, 'passages_read', 1),
('Bookworm', '책벌레', 'Read 10 passages', '지문 10개 읽기', '📚', 50, 'passages_read', 10),
('Vocabulary Builder', '단어 수집가', 'Add 50 words to vocabulary', '단어장에 50개 단어 추가', '📝', 30, 'vocabulary_count', 50),
('Quiz Master', '퀴즈 마스터', 'Score 100% on 5 quizzes', '5개 퀴즈에서 만점 받기', '🏆', 100, 'perfect_quizzes', 5),
('Writing Star', '글쓰기 스타', 'Write 10 reviews', '10개의 글쓰기 완료', '✍️', 50, 'writings_count', 10),
('Week Warrior', '일주일 전사', '7 day streak', '7일 연속 학습', '🔥', 70, 'streak_days', 7),
('Month Champion', '한달의 챔피언', '30 day streak', '30일 연속 학습', '👑', 200, 'streak_days', 30);

