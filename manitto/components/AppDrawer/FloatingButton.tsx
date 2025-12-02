'use client'

import { FloatingButtonProps } from './types'

export default function FloatingButton({
  isOpen,
  onClick,
  position = 'right'
}: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 ${position === 'right' ? 'right-6' : 'left-6'}
        w-14 h-14 md:w-16 md:h-16
        bg-gradient-to-br from-orange-400 to-red-500
        hover:from-orange-300 hover:to-red-400
        text-white text-2xl
        rounded-full shadow-lg shadow-orange-500/30
        hover:shadow-orange-500/50 hover:scale-110
        active:scale-95
        transition-all duration-200
        z-50
        ${!isOpen ? 'animate-pulse' : ''}
      `}
      aria-label={isOpen ? '드로워 닫기' : '앱 목록 열기'}
      aria-expanded={isOpen}
    >
      {isOpen ? '✕' : '🎯'}
    </button>
  )
}
