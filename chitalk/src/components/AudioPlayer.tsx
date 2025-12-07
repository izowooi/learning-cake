'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthenticatedFetch } from './AuthenticatedFetch'

type TTSVoice = 'male' | 'female'
type PlaybackSpeed = 0.5 | 1.0 | 1.5 | 2.0

interface AudioPlayerProps {
  text: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 0.5, label: '0.5x' },
  { value: 1.0, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2x' },
]

export function AudioPlayer({ text, onTimeUpdate }: AudioPlayerProps) {
  const [voice, setVoice] = useState<TTSVoice>('female')
  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const authFetch = useAuthenticatedFetch()

  // Clean up audio URL on unmount or when text changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const loadAudio = async (selectedVoice: TTSVoice) => {
    if (!text) return

    setIsLoading(true)
    try {
      const response = await authFetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice }),
      })

      if (!response.ok) throw new Error('TTS 생성 실패')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      // Clean up previous URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      
      setAudioUrl(url)
      return url
    } catch (error) {
      console.error('Audio load error:', error)
      alert('오디오 생성 중 오류가 발생했습니다.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = async () => {
    if (!audioUrl) {
      const url = await loadAudio(voice)
      if (!url) return
      
      // Wait for audio element to be ready
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.playbackRate = speed
          audioRef.current.play()
          setIsPlaying(true)
        }
      }, 100)
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleVoiceChange = async (newVoice: TTSVoice) => {
    if (newVoice === voice) return

    setVoice(newVoice)
    setIsPlaying(false)
    setProgress(0)

    // Load new audio with new voice
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const url = await loadAudio(newVoice)
    if (url && audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }

  const handleSpeedChange = (newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime
      const audioDuration = audioRef.current.duration
      setProgress((currentTime / audioDuration) * 100)
      setDuration(audioDuration)
      onTimeUpdate?.(currentTime, audioDuration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audioRef.current.currentTime = percent * duration
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration)
            }
          }}
        />
      )}

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Voice Selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">음성:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleVoiceChange('male')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                voice === 'male'
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              🎤 남자
            </button>
            <button
              onClick={() => handleVoiceChange('female')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                voice === 'female'
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              🎤 여자
            </button>
          </div>
        </div>

        {/* Speed Selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">속도:</span>
          <div className="flex gap-1">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  speed === option.value
                    ? 'bg-accent-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-10">
            {formatTime(audioRef.current?.currentTime || 0)}
          </span>
          <div
            className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Play Button */}
        <button
          onClick={handlePlay}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              오디오 생성 중...
            </>
          ) : isPlaying ? (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              일시정지
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {audioUrl ? '재생' : '듣기 시작'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

