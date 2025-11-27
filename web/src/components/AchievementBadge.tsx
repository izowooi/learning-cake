'use client'

import { useState } from 'react'

export interface Achievement {
  id: string
  name: string
  nameKo: string
  description: string
  descriptionKo: string
  icon: string
  points: number
  earned: boolean
  earnedAt?: string
}

interface AchievementBadgeProps {
  achievement: Achievement
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all cursor-pointer ${
          achievement.earned
            ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30 hover:scale-110'
            : 'bg-slate-200 dark:bg-slate-700 grayscale opacity-50 hover:opacity-70'
        }`}
      >
        {achievement.icon}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl shadow-xl z-10 animate-fade-in">
          <p className="font-bold text-center">{achievement.nameKo}</p>
          <p className="text-xs text-center text-slate-300 mt-1">{achievement.descriptionKo}</p>
          <p className="text-xs text-center text-amber-400 mt-2">
            {achievement.earned
              ? `획득! (+${achievement.points}pts)`
              : `${achievement.points}pts 획득 가능`}
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-slate-800 dark:bg-slate-700" />
        </div>
      )}
    </div>
  )
}

interface AchievementListProps {
  achievements: Achievement[]
}

export function AchievementList({ achievements }: AchievementListProps) {
  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">🏆 업적</h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {earnedCount}/{achievements.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  )
}

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    nameKo: '첫 걸음',
    description: 'Complete your first passage',
    descriptionKo: '첫 번째 지문을 완료하세요',
    icon: '🎯',
    points: 10,
    earned: false,
  },
  {
    id: '2',
    name: 'Bookworm',
    nameKo: '책벌레',
    description: 'Read 10 passages',
    descriptionKo: '지문 10개 읽기',
    icon: '📚',
    points: 50,
    earned: false,
  },
  {
    id: '3',
    name: 'Vocabulary Builder',
    nameKo: '단어 수집가',
    description: 'Add 50 words to vocabulary',
    descriptionKo: '단어장에 50개 단어 추가',
    icon: '📝',
    points: 30,
    earned: false,
  },
  {
    id: '4',
    name: 'Quiz Master',
    nameKo: '퀴즈 마스터',
    description: 'Score 100% on 5 quizzes',
    descriptionKo: '5개 퀴즈에서 만점 받기',
    icon: '🏆',
    points: 100,
    earned: false,
  },
  {
    id: '5',
    name: 'Writing Star',
    nameKo: '글쓰기 스타',
    description: 'Write 10 reviews',
    descriptionKo: '10개의 글쓰기 완료',
    icon: '✍️',
    points: 50,
    earned: false,
  },
  {
    id: '6',
    name: 'Week Warrior',
    nameKo: '일주일 전사',
    description: '7 day streak',
    descriptionKo: '7일 연속 학습',
    icon: '🔥',
    points: 70,
    earned: false,
  },
  {
    id: '7',
    name: 'Month Champion',
    nameKo: '한달의 챔피언',
    description: '30 day streak',
    descriptionKo: '30일 연속 학습',
    icon: '👑',
    points: 200,
    earned: false,
  },
]

