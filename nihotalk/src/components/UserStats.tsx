'use client'

interface UserStatsProps {
  points: number
  level: number
  streak: number
  passagesRead: number
  wordsLearned: number
  quizzesCompleted: number
  writingsSubmitted: number
}

export function UserStats({
  points,
  level,
  streak,
  passagesRead,
  wordsLearned,
  quizzesCompleted,
  writingsSubmitted,
}: UserStatsProps) {
  const nextLevelPoints = level * 100
  const currentLevelProgress = (points % 100) / 100

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Level and Points Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {level}
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">레벨</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Level {level}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">포인트</p>
          <p className="text-lg font-bold text-primary-500">{points} pts</p>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>다음 레벨까지</span>
          <span>{Math.round(currentLevelProgress * 100)}%</span>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${currentLevelProgress * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1 text-right">
          {nextLevelPoints - (points % 100)} pts 남음
        </p>
      </div>

      {/* Streak */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{streak >= 7 ? '🔥' : streak >= 3 ? '⭐' : '✨'}</div>
          <div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {streak}일 연속
            </p>
            <p className="text-sm text-orange-700/70 dark:text-orange-300/70">
              {streak >= 7 
                ? '대단해요! 일주일째 공부 중!' 
                : streak >= 3 
                ? '좋은 습관이 만들어지고 있어요!'
                : '오늘도 화이팅!'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="📖" label="읽은 지문" value={passagesRead} />
        <StatCard icon="📝" label="학습 단어" value={wordsLearned} />
        <StatCard icon="❓" label="퀴즈 완료" value={quizzesCompleted} />
        <StatCard icon="✍️" label="글쓰기" value={writingsSubmitted} />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

