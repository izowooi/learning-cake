'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserStats } from '@/components/UserStats'
import { AchievementList, DEFAULT_ACHIEVEMENTS, type Achievement } from '@/components/AchievementBadge'
import { StreakCalendar } from '@/components/StreakCalendar'
import { ProtectedPage } from '@/components/ProtectedPage'

// Mock data - in real app, this would come from Supabase
const mockUserData = {
  name: '일본어학습자',
  points: 245,
  level: 3,
  streak: 5,
  passagesRead: 12,
  wordsLearned: 47,
  quizzesCompleted: 8,
  writingsSubmitted: 4,
}

// Mock activity dates
const mockActivityDates = [
  new Date().toISOString().split('T')[0], // today
  new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
  new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
  new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
  new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
  new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
  new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0],
  new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0],
]

// Mark some achievements as earned based on mock data
const getAchievements = (): Achievement[] => {
  return DEFAULT_ACHIEVEMENTS.map((achievement) => {
    let earned = false
    
    switch (achievement.id) {
      case '1': // First Steps
        earned = mockUserData.passagesRead >= 1
        break
      case '2': // Bookworm
        earned = mockUserData.passagesRead >= 10
        break
      case '3': // Vocabulary Builder
        earned = mockUserData.wordsLearned >= 50
        break
      case '6': // Week Warrior
        earned = mockUserData.streak >= 7
        break
    }
    
    return { ...achievement, earned }
  })
}

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <ProfilePageContent />
    </ProtectedPage>
  )
}

function ProfilePageContent() {
  const [achievements] = useState<Achievement[]>(getAchievements())

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              NihoTalk
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/study"
              className="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              학습하기
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold">{mockUserData.name}</h1>
              <p className="text-white/80">Level {mockUserData.level} 학습자</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <UserStats
              points={mockUserData.points}
              level={mockUserData.level}
              streak={mockUserData.streak}
              passagesRead={mockUserData.passagesRead}
              wordsLearned={mockUserData.wordsLearned}
              quizzesCompleted={mockUserData.quizzesCompleted}
              writingsSubmitted={mockUserData.writingsSubmitted}
            />
            <AchievementList achievements={achievements} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <StreakCalendar activityDates={mockActivityDates} />
            
            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                📊 최근 활동
              </h3>
              <div className="space-y-3">
                <ActivityItem
                  icon="📖"
                  title="지문 읽기"
                  description="'睡眠の科学'을 읽었습니다"
                  time="오늘"
                  points={10}
                />
                <ActivityItem
                  icon="❓"
                  title="퀴즈 완료"
                  description="5문제 중 4문제 정답!"
                  time="오늘"
                  points={20}
                />
                <ActivityItem
                  icon="📝"
                  title="단어 추가"
                  description="'現象(げんしょう)' 외 2개 추가"
                  time="어제"
                  points={15}
                />
                <ActivityItem
                  icon="✍️"
                  title="글쓰기"
                  description="첫 일본어 작문을 작성했습니다"
                  time="2일 전"
                  points={30}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/study"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            오늘의 학습 시작하기 🚀
          </Link>
        </div>
      </main>
    </div>
  )
}

function ActivityItem({
  icon,
  title,
  description,
  time,
  points,
}: {
  icon: string
  title: string
  description: string
  time: string
  points: number
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 dark:text-slate-200">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-slate-400">{time}</p>
        <p className="text-sm font-medium text-primary-500">+{points}pts</p>
      </div>
    </div>
  )
}

