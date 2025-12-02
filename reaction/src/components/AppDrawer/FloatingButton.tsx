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
        bg-gray-800/90 hover:bg-gray-700/90
        backdrop-blur-sm
        text-white text-2xl
        rounded-full shadow-lg shadow-black/20
        hover:shadow-black/30 hover:scale-110
        active:scale-95
        transition-all duration-200
        z-50
        border border-white/10
        ${!isOpen ? 'animate-pulse' : ''}
      `}
      aria-label={isOpen ? '드로워 닫기' : '앱 목록 열기'}
      aria-expanded={isOpen}
    >
      {isOpen ? '✕' : '🎯'}
    </button>
  )
}
