// Database types for Supabase tables
// These will be auto-generated from Supabase once the schema is set up

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  level: number
  points: number
  streak_days: number
  created_at: string
  updated_at: string
}

export interface Passage {
  id: string
  user_id: string
  title: string
  content: string
  topic: string
  category: string
  difficulty: 'elementary' | 'middle_low' | 'middle_high' | 'high_school' | 'college'
  length: 'short' | 'medium' | 'long'
  word_count: number
  audio_url_us: string | null
  audio_url_uk: string | null
  created_at: string
}

export interface Vocabulary {
  id: string
  user_id: string
  passage_id: string | null
  word: string
  pronunciation: string
  part_of_speech: string
  definition: string
  definition_korean: string
  english_definition: string
  examples: string[]
  mastery_level: number
  review_count: number
  last_reviewed_at: string | null
  created_at: string
}

export interface QuizResult {
  id: string
  user_id: string
  passage_id: string
  questions: QuizQuestion[]
  answers: number[]
  score: number
  completed_at: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

export interface Writing {
  id: string
  user_id: string
  passage_id: string
  content: string
  ai_review: AIWritingReview | null
  created_at: string
  updated_at: string
}

export interface AIWritingReview {
  praise: string
  grammar_feedback: GrammarFeedback[]
  style_suggestions: string[]
  encouragement: string
  overall_score: number
}

export interface GrammarFeedback {
  original: string
  suggestion: string
  explanation: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  requirement: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

export interface LearningHistory {
  id: string
  user_id: string
  passage_id: string
  activity_type: 'read' | 'listen' | 'quiz' | 'write'
  duration_seconds: number
  points_earned: number
  created_at: string
}

