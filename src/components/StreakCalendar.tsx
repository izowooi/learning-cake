'use client'

interface StreakCalendarProps {
  activityDates: string[] // ISO date strings
}

export function StreakCalendar({ activityDates }: StreakCalendarProps) {
  const today = new Date()
  const activitySet = new Set(activityDates)
  
  // Generate last 28 days (4 weeks)
  const days: { date: Date; hasActivity: boolean }[] = []
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      date,
      hasActivity: activitySet.has(dateStr),
    })
  }

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
        📅 학습 기록
      </h3>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-slate-500 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isToday =
            day.date.toISOString().split('T')[0] ===
            today.toISOString().split('T')[0]
          
          return (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                day.hasActivity
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
              } ${isToday ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-800' : ''}`}
              title={`${day.date.getMonth() + 1}/${day.date.getDate()}`}
            >
              {day.date.getDate()}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-700" />
          <span className="text-slate-500">미학습</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-slate-500">학습 완료</span>
        </div>
      </div>
    </div>
  )
}

