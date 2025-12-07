'use client'

import { useState } from 'react'

export type DifficultyLevel = 'beginner1' | 'beginner2' | 'intermediate1' | 'intermediate2' | 'advanced'
export type PassageLength = 'short' | 'medium' | 'long'
export type TopicCategory = 'humanities' | 'social' | 'science' | 'culture' | 'history' | 'arts' | 'general' | 'random' | 'custom'

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; description: string }[] = [
  { value: 'beginner1', label: '초급 1', description: 'HSK 1-2급 (아주 쉬움)' },
  { value: 'beginner2', label: '초급 2', description: 'HSK 2-3급' },
  { value: 'intermediate1', label: '중급 1', description: 'HSK 3-4급' },
  { value: 'intermediate2', label: '중급 2', description: 'HSK 4-5급' },
  { value: 'advanced', label: '고급', description: 'HSK 5-6급' },
]

const LENGTH_OPTIONS: { value: PassageLength; label: string; chars: string }[] = [
  { value: 'short', label: '짧은 글', chars: '100-150 글자' },
  { value: 'medium', label: '보통', chars: '200-300 글자' },
  { value: 'long', label: '긴 글', chars: '400-500 글자' },
]

const CATEGORY_OPTIONS: { value: TopicCategory; label: string; icon: string }[] = [
  { value: 'random', label: '랜덤', icon: '🎲' },
  { value: 'humanities', label: '인문', icon: '📖' },
  { value: 'social', label: '사회', icon: '🌍' },
  { value: 'science', label: '과학', icon: '🔬' },
  { value: 'culture', label: '문화', icon: '🎭' },
  { value: 'history', label: '역사', icon: '🏛️' },
  { value: 'arts', label: '예술', icon: '🎨' },
  { value: 'general', label: '상식', icon: '💡' },
  { value: 'custom', label: '직접 입력', icon: '✏️' },
]

interface PassageFormProps {
  onGenerate: (params: {
    topic?: string
    difficulty: DifficultyLevel
    length: PassageLength
    category: TopicCategory
  }) => void
  isLoading: boolean
}

export function PassageForm({ onGenerate, isLoading }: PassageFormProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner2')
  const [length, setLength] = useState<PassageLength>('medium')
  const [category, setCategory] = useState<TopicCategory>('random')
  const [customTopic, setCustomTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({
      topic: category === 'custom' ? customTopic : undefined,
      difficulty,
      length,
      category,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          난이도
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDifficulty(option.value)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                difficulty === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
              }`}
            >
              <div className="font-medium text-slate-800 dark:text-slate-200">{option.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Length Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          글 길이
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LENGTH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLength(option.value)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                length === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
              }`}
            >
              <div className="font-medium text-slate-800 dark:text-slate-200">{option.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{option.chars}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          주제
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                category === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Topic Input */}
      {category === 'custom' && (
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            원하는 주제를 입력하세요
          </label>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="예: 우주 탐험, 한국의 전통 음식, 인공지능의 미래..."
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isLoading || (category === 'custom' && !customTopic.trim())}
        className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            지문 생성 중...
          </span>
        ) : (
          '✨ 지문 생성하기'
        )}
      </button>
    </form>
  )
}

