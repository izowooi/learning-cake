-- Learning History table
CREATE TABLE IF NOT EXISTS learning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('read', 'listen', 'quiz', 'write', 'vocabulary')),
  duration_seconds INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_learning_history_user_id ON learning_history(user_id);
CREATE INDEX idx_learning_history_created_at ON learning_history(created_at DESC);
CREATE INDEX idx_learning_history_activity ON learning_history(user_id, activity_type);

-- Enable RLS
ALTER TABLE learning_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own history" ON learning_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON learning_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update user points and streak
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update points
  UPDATE profiles 
  SET 
    points = points + NEW.points_earned,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Update streak if it's a new day
  UPDATE profiles 
  SET 
    streak_days = CASE 
      WHEN last_activity_date = CURRENT_DATE - 1 THEN streak_days + 1
      WHEN last_activity_date < CURRENT_DATE - 1 THEN 1
      ELSE streak_days
    END,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = NEW.user_id 
    AND (last_activity_date IS NULL OR last_activity_date < CURRENT_DATE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating stats
DROP TRIGGER IF EXISTS on_learning_activity ON learning_history;
CREATE TRIGGER on_learning_activity
  AFTER INSERT ON learning_history
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

