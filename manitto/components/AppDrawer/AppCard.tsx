'use client'

import { AppCardProps } from './types'

export default function AppCard({ app, onClick }: AppCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full p-4 flex items-center gap-4
        bg-white/60 hover:bg-white/80
        dark:bg-orange-900/30 dark:hover:bg-orange-900/50
        backdrop-blur-sm border border-orange-200/40 dark:border-orange-800/40
        hover:border-orange-300/60 dark:hover:border-orange-700/60
        rounded-xl
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-200/20 dark:hover:shadow-orange-900/20
        active:scale-[0.98]
        group
      "
    >
      {/* Icon */}
      <div className="
        w-12 h-12 md:w-14 md:h-14
        flex items-center justify-center
        text-3xl md:text-4xl
        bg-orange-100/70 dark:bg-orange-900/50 rounded-lg
        group-hover:scale-110 transition-transform duration-200
      ">
        {app.imageUrl ? (
          <img
            src={app.imageUrl}
            alt={`${app.name} 아이콘`}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          app.icon
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <h3 className="
          text-orange-900 dark:text-orange-100 font-bold text-base md:text-lg
          group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors
        ">
          {app.name}
        </h3>
        <p className="text-orange-800/70 dark:text-orange-200/70 text-xs md:text-sm line-clamp-2">
          {app.description}
        </p>
      </div>

      {/* External Link Icon */}
      <div className="text-orange-600/60 dark:text-orange-400/60 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
        ↗
      </div>
    </button>
  )
}
