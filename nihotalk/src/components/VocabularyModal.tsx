'use client'

import { useState, useEffect } from 'react'
import { useAuthenticatedFetch } from './AuthenticatedFetch'

interface WordDefinition {
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  definitionKorean: string
  japaneseDefinition: string
  examples: string[]
}

interface VocabularyModalProps {
  word: string
  context: string
  onClose: () => void
  onAdd: (definition: WordDefinition) => void
}

export function VocabularyModal({ word, context, onClose, onAdd }: VocabularyModalProps) {
  const [definition, setDefinition] = useState<WordDefinition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authFetch = useAuthenticatedFetch()

  useEffect(() => {
    const fetchDefinition = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await authFetch('/api/vocabulary/define', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word, context }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '단어 정의를 가져올 수 없습니다.')
        }

        setDefinition(data.definition)
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDefinition()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, context])

  const handleAdd = () => {
    if (definition) {
      onAdd(definition)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">📝 단어 정보</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="animate-spin h-10 w-10 text-primary-500 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-600 dark:text-slate-400">단어 정보를 가져오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                닫기
              </button>
            </div>
          ) : definition ? (
            <div className="space-y-4">
              {/* Word and Pronunciation */}
              <div>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {definition.word}
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  {definition.pronunciation}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                  {definition.partOfSpeech}
                </span>
              </div>

              {/* Korean Definition */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <h5 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">한국어 뜻</h5>
                <p className="text-lg text-slate-800 dark:text-slate-200">{definition.definitionKorean}</p>
              </div>

              {/* Japanese Definition */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <h5 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">일일사전 (日本語説明)</h5>
                <p className="text-slate-700 dark:text-slate-300">{definition.japaneseDefinition}</p>
              </div>

              {/* Examples */}
              {definition.examples.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">예문</h5>
                  <ul className="space-y-2">
                    {definition.examples.map((example, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary-500">•</span>
                        <span className="text-slate-700 dark:text-slate-300 italic">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {definition && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              단어장에 추가
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

