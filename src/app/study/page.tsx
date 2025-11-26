'use client'

import { useState } from 'react'
import { PassageForm, type DifficultyLevel, type PassageLength, type TopicCategory } from '@/components/PassageForm'
import { PassageViewer } from '@/components/PassageViewer'
import { AudioPlayer } from '@/components/AudioPlayer'
import { VocabularyModal } from '@/components/VocabularyModal'
import { QuizComponent } from '@/components/QuizComponent'
import { WritingComponent } from '@/components/WritingComponent'
import Link from 'next/link'

interface GeneratedPassage {
  title: string
  content: string
  topic: string
  category: string
  difficulty: string
  length: string
  wordCount: number
}

interface WordDefinition {
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  definitionKorean: string
  englishDefinition: string
  examples: string[]
}

export default function StudyPage() {
  const [passage, setPassage] = useState<GeneratedPassage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWord, setSelectedWord] = useState<{ word: string; sentence: string } | null>(null)
  const [vocabulary, setVocabulary] = useState<WordDefinition[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [showWriting, setShowWriting] = useState(false)
  const [showVocabularyList, setShowVocabularyList] = useState(false)

  const handleGenerate = async (params: {
    topic?: string
    difficulty: DifficultyLevel
    length: PassageLength
    category: TopicCategory
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/passage/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '지문 생성에 실패했습니다.')
      }

      setPassage(data.passage)
      setShowQuiz(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWordClick = (word: string, sentence: string) => {
    setSelectedWord({ word, sentence })
  }

  const handleAddToVocabulary = (definition: WordDefinition) => {
    // Check if word already exists
    if (vocabulary.some(v => v.word.toLowerCase() === definition.word.toLowerCase())) {
      alert('이미 단어장에 있는 단어입니다!')
      setSelectedWord(null)
      return
    }
    
    setVocabulary([...vocabulary, definition])
    setSelectedWord(null)
    alert(`"${definition.word}"를 단어장에 추가했습니다! 📝`)
  }

  const handleQuizComplete = (score: number, total: number) => {
    console.log(`Quiz completed: ${score}/${total}`)
  }

  const handleRemoveWord = (index: number) => {
    setVocabulary(vocabulary.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎂</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Learning Cake
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {vocabulary.length > 0 && (
              <button
                onClick={() => setShowVocabularyList(!showVocabularyList)}
                className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                📚 단어장 ({vocabulary.length})
              </button>
            )}
            <Link
              href="/profile"
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              👤 프로필
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        {!passage && (
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              오늘은 어떤 주제로 공부할까요? 📚
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              원하는 난이도, 길이, 주제를 선택하면 AI가 맞춤형 영어 지문을 생성해드려요.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Form or Controls */}
          <div className={`${passage ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              {passage ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                      🎧 듣기
                    </h3>
                    <AudioPlayer text={passage.content} />
                  </div>
                  
                  <hr className="border-slate-200 dark:border-slate-700" />
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                      🔄 새 지문 생성
                    </h3>
                    <PassageForm onGenerate={handleGenerate} isLoading={isLoading} />
                  </div>
                </div>
              ) : (
                <PassageForm onGenerate={handleGenerate} isLoading={isLoading} />
              )}
            </div>
          </div>

          {/* Right Panel - Passage Viewer */}
          {passage && (
            <div className="lg:col-span-2 animate-slide-up">
              <PassageViewer
                title={passage.title}
                content={passage.content}
                wordCount={passage.wordCount}
                difficulty={passage.difficulty}
                category={passage.category}
                onWordClick={handleWordClick}
              />
              
              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  onClick={() => setShowQuiz(true)}
                >
                  ❓ 문제 풀기
                </button>
                <button
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  onClick={() => setShowWriting(true)}
                >
                  ✍️ 글쓰기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
            <p className="font-medium">오류가 발생했습니다</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
      </main>

      {/* Vocabulary List Sidebar */}
      {showVocabularyList && vocabulary.length > 0 && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 shadow-2xl z-50 animate-slide-up overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">📚 내 단어장</h3>
              <button
                onClick={() => setShowVocabularyList(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {vocabulary.map((word, index) => (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{word.word}</p>
                      <p className="text-xs text-slate-500">{word.pronunciation}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{word.definitionKorean}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveWord(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-center text-sm text-slate-500">
                총 {vocabulary.length}개 단어
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vocabulary Modal */}
      {selectedWord && (
        <VocabularyModal
          word={selectedWord.word}
          context={selectedWord.sentence}
          onClose={() => setSelectedWord(null)}
          onAdd={handleAddToVocabulary}
        />
      )}

      {/* Quiz Modal */}
      {showQuiz && passage && (
        <QuizComponent
          passage={passage.content}
          title={passage.title}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {/* Writing Modal */}
      {showWriting && passage && (
        <WritingComponent
          passage={passage.content}
          title={passage.title}
          onClose={() => setShowWriting(false)}
        />
      )}
    </div>
  )
}
