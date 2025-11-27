'use client'

import { useState, useEffect } from 'react'
import { useAuthenticatedFetch } from './AuthenticatedFetch'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizComponentProps {
  passage: string
  title: string
  onComplete: (score: number, total: number) => void
  onClose: () => void
}

export function QuizComponent({ passage, title, onComplete, onClose }: QuizComponentProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const authFetch = useAuthenticatedFetch()

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await authFetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passage, title }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '퀴즈를 생성할 수 없습니다.')
        }

        setQuestions(data.quiz.questions)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passage, title])

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return
    setShowResult(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer!]
    setAnswers(newAnswers)
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Quiz completed
      const correctCount = newAnswers.reduce((count, answer, idx) => {
        return count + (answer === questions[idx].correctAnswer ? 1 : 0)
      }, 0)
      setIsCompleted(true)
      onComplete(correctCount, questions.length)
    }
  }

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index) // A, B, C, D, E
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">퀴즈를 생성하고 있어요...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">잠시만 기다려주세요 🤔</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    const score = answers.reduce((count, answer, idx) => {
      return count + (answer === questions[idx].correctAnswer ? 1 : 0)
    }, 0)
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            퀴즈 완료!
          </h3>
          <p className="text-4xl font-bold text-primary-500 mb-4">
            {score}/{questions.length}
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {percentage >= 80
              ? '대단해요! 정말 잘했어요! 🌟'
              : percentage >= 60
              ? '잘했어요! 조금 더 연습하면 완벽해질 거예요!'
              : '괜찮아요! 다시 읽고 도전해봐요!'}
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            확인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">❓ 독해 퀴즈</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>문제 {currentIndex + 1} / {questions.length}</span>
              <span>{Math.round(((currentIndex) / questions.length) * 100)}% 완료</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <p className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-6">
            {currentQuestion?.question}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = index === currentQuestion.correctAnswer
              const showCorrectness = showResult

              let optionClass = 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
              
              if (showCorrectness) {
                if (isCorrect) {
                  optionClass = 'border-green-500 bg-green-50 dark:bg-green-900/20'
                } else if (isSelected && !isCorrect) {
                  optionClass = 'border-red-500 bg-red-50 dark:bg-red-900/20'
                }
              } else if (isSelected) {
                optionClass = 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${optionClass} ${
                    showResult ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      showCorrectness && isCorrect
                        ? 'bg-green-500 text-white'
                        : showCorrectness && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {getOptionLabel(index)}
                    </span>
                    <span className="flex-1 text-slate-700 dark:text-slate-300">
                      {option}
                    </span>
                    {showCorrectness && isCorrect && (
                      <span className="text-green-500">✓</span>
                    )}
                    {showCorrectness && isSelected && !isCorrect && (
                      <span className="text-red-500">✗</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl animate-slide-up">
              <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">💡 해설</h5>
              <p className="text-blue-700 dark:text-blue-400">{currentQuestion?.explanation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          {!showResult ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedAnswer === null}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              정답 확인
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              {currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

