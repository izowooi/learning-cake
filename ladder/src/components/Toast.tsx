'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      role="alert"
      aria-live="polite"
    >
      <div
        className={`
          px-6 py-3 rounded-lg backdrop-blur-lg border
          text-white font-medium shadow-lg
          ${
            type === 'success'
              ? 'bg-green-500/20 border-green-400/50'
              : 'bg-red-500/20 border-red-400/50'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <span>{type === 'success' ? '✅' : '❌'}</span>
          <span>{message}</span>
        </div>
      </div>
    </div>
  )
}
