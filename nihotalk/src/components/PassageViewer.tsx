'use client'

interface PassageViewerProps {
  title: string
  content: string
  wordCount: number
  difficulty: string
  category: string
  onWordClick?: (word: string, sentence: string) => void
}

const DIFFICULTY_LABELS: Record<string, string> = {
  n5: 'JLPT N5',
  n4: 'JLPT N4',
  n3: 'JLPT N3',
  n2: 'JLPT N2',
  n1: 'JLPT N1',
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  humanities: { label: '인문', icon: '📖' },
  social: { label: '사회', icon: '🌍' },
  science: { label: '과학', icon: '🔬' },
  culture: { label: '문화', icon: '🎭' },
  history: { label: '역사', icon: '🏛️' },
  arts: { label: '예술', icon: '🎨' },
  general: { label: '상식', icon: '💡' },
  random: { label: '랜덤', icon: '🎲' },
  custom: { label: '사용자 지정', icon: '✏️' },
}

export function PassageViewer({
  title,
  content,
  wordCount,
  difficulty,
  category,
  onWordClick,
}: PassageViewerProps) {
  const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!onWordClick) return
    
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      // Get the sentence containing the word
      const text = e.currentTarget.closest('p')?.textContent || ''
      const word = selection.toString().trim()
      onWordClick(word, text)
    }
  }

  const renderContent = () => {
    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(Boolean)
    
    return paragraphs.map((paragraph, index) => (
      <p
        key={index}
        className="mb-4 last:mb-0 leading-relaxed"
        onClick={handleWordClick}
      >
        {paragraph}
      </p>
    ))
  }

  const categoryInfo = CATEGORY_LABELS[category] || { label: category, icon: '📝' }
  const difficultyLabel = DIFFICULTY_LABELS[difficulty] || difficulty

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          {title}
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-sm">
            {categoryInfo.icon} {categoryInfo.label}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-sm">
            📊 {difficultyLabel}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-sm">
            📝 {wordCount} 글자
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 selection:bg-primary-200 dark:selection:bg-primary-800">
          {renderContent()}
        </div>
        
        {onWordClick && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic">
            💡 단어를 드래그하여 선택하면 단어장에 추가할 수 있어요!
          </p>
        )}
      </div>
    </div>
  )
}

