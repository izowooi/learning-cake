'use client'

import { useState } from 'react'
import { useAuthenticatedFetch } from './AuthenticatedFetch'

interface GrammarFeedback {
  original: string
  suggestion: string
  explanation: string
}

interface AIReview {
  praise: string
  grammarFeedback: GrammarFeedback[]
  styleSuggestions: string[]
  encouragement: string
  overallScore: number
}

interface WritingComponentProps {
  passage: string
  title: string
  onClose: () => void
}

export function WritingComponent({ passage, title, onClose }: WritingComponentProps) {
  const [content, setContent] = useState('')
  const [review, setReview] = useState<AIReview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authFetch = useAuthenticatedFetch()

  const handleSubmit = async () => {
    if (content.length < 10) {
      setError('최소 10자 이상 작성해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authFetch('/api/writing/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage,
          userWriting: content,
          title,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '리뷰를 가져올 수 없습니다.')
      }

      setReview(data.review)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-blue-500'
    if (score >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟'
    if (score >= 70) return '👍'
    if (score >= 50) return '💪'
    return '📝'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">✍️ 내 생각 쓰기</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-white/80 mt-1">
            &quot;{title}&quot;에 대한 생각을 자유롭게 일본어로 써보세요!
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!review ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  지문을 읽고 느낀 점, 생각, 의견을 일본어로 작성해보세요
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="この文章を読んで、私は..."
                  className="w-full h-48 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-purple-500 focus:outline-none transition-colors resize-none text-slate-800 dark:text-slate-200"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {content.length}자 작성됨 (최소 10자)
                  </p>
                  {content.length >= 10 && (
                    <span className="text-sm text-green-500">✓ 제출 가능</span>
                  )}
                </div>
              </div>

              {/* Writing Tips */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">💡 작성 팁</h4>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li>• 지문의 주제에 대한 나의 의견을 써보세요</li>
                  <li>• 새롭게 알게 된 점이나 흥미로운 점을 설명해보세요</li>
                  <li>• 관련된 나의 경험이나 생각을 공유해보세요</li>
                </ul>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Score */}
              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl">
                <div className="text-5xl mb-2">{getScoreEmoji(review.overallScore)}</div>
                <div className={`text-4xl font-bold ${getScoreColor(review.overallScore)}`}>
                  {review.overallScore}점
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-2">전체 점수</p>
              </div>

              {/* Praise */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">🌟 칭찬</h4>
                <p className="text-green-700 dark:text-green-400">{review.praise}</p>
              </div>

              {/* Grammar Feedback */}
              {review.grammarFeedback.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">📝 문법 피드백</h4>
                  {review.grammarFeedback.map((feedback, index) => (
                    <div key={index} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className="text-sm text-slate-500">원문:</span>
                          <p className="text-red-600 dark:text-red-400 line-through">{feedback.original}</p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">수정:</span>
                          <p className="text-green-600 dark:text-green-400">{feedback.suggestion}</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                          💡 {feedback.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Style Suggestions */}
              {review.styleSuggestions.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">✨ 표현 제안</h4>
                  <ul className="space-y-2">
                    {review.styleSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-blue-700 dark:text-blue-400">
                        <span>•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Encouragement */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2">💪 응원 메시지</h4>
                <p className="text-purple-700 dark:text-purple-400">{review.encouragement}</p>
              </div>

              {/* Original Writing */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <h4 className="font-medium text-slate-600 dark:text-slate-400 mb-2">내가 쓴 글</h4>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{content}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          {!review ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading || content.length < 10}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  리뷰를 받고 있어요...
                </span>
              ) : (
                '📤 리뷰 받기'
              )}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReview(null)
                  setContent('')
                }}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                다시 쓰기
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
              >
                완료
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

