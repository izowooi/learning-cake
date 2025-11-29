'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  generateHorizontalLines, 
  calculatePaths, 
  createPathString,
  calculatePathLength,
  HorizontalLine,
  LadderPath,
  PARTICIPANT_COLORS
} from '@/utils/ladderLogic'

const MIN_PARTICIPANTS = 2
const MAX_PARTICIPANTS = 15
const DEFAULT_PARTICIPANTS = 5
const ROW_COUNT = 12

export default function LadderGame() {
  const [participantCount, setParticipantCount] = useState(DEFAULT_PARTICIPANTS)
  const [tempCount, setTempCount] = useState(DEFAULT_PARTICIPANTS)
  const [names, setNames] = useState<string[]>(Array(DEFAULT_PARTICIPANTS).fill(''))
  const [prizes, setPrizes] = useState<string[]>(Array(DEFAULT_PARTICIPANTS).fill(''))
  const [horizontalLines, setHorizontalLines] = useState<HorizontalLine[]>([])
  const [paths, setPaths] = useState<LadderPath[]>([])
  const [pathLengths, setPathLengths] = useState<number[]>([])
  const [maxPathLength, setMaxPathLength] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })

  // 반응형 크기 조정
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 40, 800)
        const height = Math.min(400, width * 0.6)
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // 참가자 수 적용
  const applyParticipantCount = useCallback(() => {
    const count = Math.max(MIN_PARTICIPANTS, Math.min(MAX_PARTICIPANTS, tempCount))
    setParticipantCount(count)
    setTempCount(count)
    
    // 이름과 경품 배열 크기 조정
    setNames(prev => {
      const newNames = [...prev]
      while (newNames.length < count) newNames.push('')
      return newNames.slice(0, count)
    })
    setPrizes(prev => {
      const newPrizes = [...prev]
      while (newPrizes.length < count) newPrizes.push('')
      return newPrizes.slice(0, count)
    })
    
    // 게임 상태 초기화
    setHorizontalLines([])
    setPaths([])
    setShowResults(false)
    setIsPlaying(false)
  }, [tempCount])

  // 초기화
  const handleReset = useCallback(() => {
    setNames(Array(participantCount).fill(''))
    setPrizes(Array(participantCount).fill(''))
    setHorizontalLines([])
    setPaths([])
    setShowResults(false)
    setIsPlaying(false)
    setAnimationProgress(0)
  }, [participantCount])

  // 게임 시작
  const handleStart = useCallback(() => {
    if (isPlaying) return

    setIsPlaying(true)
    setShowResults(false)
    setAnimationProgress(0)

    // 가로선 생성
    const lines = generateHorizontalLines(participantCount, ROW_COUNT)
    setHorizontalLines(lines)

    // 경로 계산
    const calculatedPaths = calculatePaths(participantCount, lines, ROW_COUNT)
    setPaths(calculatedPaths)

    // 각 경로의 길이 계산
    const lengths = calculatedPaths.map(pathData => 
      calculatePathLength(
        pathData.path,
        dimensions.width,
        dimensions.height,
        participantCount,
        ROW_COUNT
      )
    )
    setPathLengths(lengths)
    
    // 가장 긴 경로 찾기
    const maxLength = Math.max(...lengths)
    setMaxPathLength(maxLength)

    // 애니메이션 진행
    const animationDuration = 2500
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      setAnimationProgress(progress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
        setShowResults(true)
      }
    }

    requestAnimationFrame(animate)
  }, [isPlaying, participantCount, dimensions])

  // 이름 변경
  const handleNameChange = (index: number, value: string) => {
    setNames(prev => {
      const newNames = [...prev]
      newNames[index] = value
      return newNames
    })
  }

  // 경품 변경
  const handlePrizeChange = (index: number, value: string) => {
    setPrizes(prev => {
      const newPrizes = [...prev]
      newPrizes[index] = value
      return newPrizes
    })
  }

  const colWidth = dimensions.width / (participantCount - 1 || 1)

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-2 drop-shadow-lg">
            🪜 사다리타기
          </h1>
          <p className="text-white/60 text-sm md:text-base">
            공정한 추첨을 위한 랜덤 사다리 게임
          </p>
        </header>

        {/* 설정 영역 */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 mb-6 border border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-white/80 font-medium">참가자 수</span>
              <button
                className="btn-count"
                onClick={() => setTempCount(prev => Math.max(MIN_PARTICIPANTS, prev - 1))}
                disabled={tempCount <= MIN_PARTICIPANTS || isPlaying}
              >
                −
              </button>
              <input
                type="number"
                value={tempCount}
                onChange={(e) => setTempCount(Math.max(MIN_PARTICIPANTS, Math.min(MAX_PARTICIPANTS, parseInt(e.target.value) || MIN_PARTICIPANTS)))}
                className="w-16 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-white font-bold"
                min={MIN_PARTICIPANTS}
                max={MAX_PARTICIPANTS}
                disabled={isPlaying}
              />
              <button
                className="btn-count"
                onClick={() => setTempCount(prev => Math.min(MAX_PARTICIPANTS, prev + 1))}
                disabled={tempCount >= MAX_PARTICIPANTS || isPlaying}
              >
                +
              </button>
              <button
                className="btn-secondary ml-2"
                onClick={applyParticipantCount}
                disabled={isPlaying}
              >
                적용
              </button>
            </div>
            <button
              className="btn-secondary"
              onClick={handleReset}
              disabled={isPlaying}
            >
              🔄 초기화
            </button>
          </div>
          <p className="text-center text-white/40 text-xs mt-3">
            {MIN_PARTICIPANTS}명 ~ {MAX_PARTICIPANTS}명까지 설정 가능
          </p>
        </div>

        {/* 사다리 영역 */}
        <div 
          ref={containerRef}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 mb-6 border border-white/10"
        >
          {/* 상단 이름 입력 */}
          <div 
            className="flex justify-between mb-4 px-2"
            style={{ 
              marginLeft: participantCount > 1 ? 0 : '50%',
              transform: participantCount > 1 ? 'none' : 'translateX(-50%)'
            }}
          >
            {Array.from({ length: participantCount }).map((_, index) => (
              <div 
                key={`name-${index}`} 
                className="flex flex-col items-center"
                style={{ width: participantCount > 1 ? `${100 / participantCount}%` : 'auto' }}
              >
                <div 
                  className="w-4 h-4 rounded-full mb-2 shadow-lg"
                  style={{ backgroundColor: PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length] }}
                />
                <input
                  type="text"
                  value={names[index] || ''}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`참가자${index + 1}`}
                  className="input-field max-w-[80px] md:max-w-[100px] text-xs md:text-sm"
                  disabled={isPlaying}
                />
              </div>
            ))}
          </div>

          {/* 사다리 SVG */}
          <div className="relative overflow-hidden rounded-xl">
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="mx-auto block"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              {/* 수직선 */}
              {Array.from({ length: participantCount }).map((_, index) => {
                const x = participantCount > 1 ? index * colWidth : dimensions.width / 2
                return (
                  <line
                    key={`vertical-${index}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={dimensions.height}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={3}
                    className="ladder-line"
                  />
                )
              })}

              {/* 가로선 */}
              {horizontalLines.map((line, index) => {
                const rowHeight = dimensions.height / ROW_COUNT
                const x1 = line.col * colWidth
                const x2 = (line.col + 1) * colWidth
                const y = (line.row + 0.5) * rowHeight
                return (
                  <line
                    key={`horizontal-${index}`}
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth={3}
                    className="ladder-line"
                  />
                )
              })}

              {/* 경로 애니메이션 */}
              {paths.map((pathData, index) => {
                const pathString = createPathString(
                  pathData.path,
                  dimensions.width,
                  dimensions.height,
                  participantCount,
                  ROW_COUNT
                )
                
                // 각 경로의 실제 길이 사용 (여유분 추가)
                const pathLength = (pathLengths[index] || 1000) + 50
                
                return (
                  <path
                    key={`path-${index}`}
                    d={pathString}
                    fill="none"
                    stroke={pathData.color}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ladder-line"
                    style={{
                      strokeDasharray: pathLength,
                      strokeDashoffset: pathLength * (1 - animationProgress),
                      filter: `drop-shadow(0 0 8px ${pathData.color})`,
                    }}
                  />
                )
              })}
            </svg>
          </div>

          {/* 하단 경품 입력 */}
          <div 
            className="flex justify-between mt-4 px-2"
            style={{ 
              marginLeft: participantCount > 1 ? 0 : '50%',
              transform: participantCount > 1 ? 'none' : 'translateX(-50%)'
            }}
          >
            {Array.from({ length: participantCount }).map((_, index) => (
              <div 
                key={`prize-${index}`} 
                className="flex flex-col items-center"
                style={{ width: participantCount > 1 ? `${100 / participantCount}%` : 'auto' }}
              >
                <input
                  type="text"
                  value={prizes[index] || ''}
                  onChange={(e) => handlePrizeChange(index, e.target.value)}
                  placeholder={`경품${index + 1}`}
                  className="input-field max-w-[80px] md:max-w-[100px] text-xs md:text-sm"
                  disabled={isPlaying}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="text-center mb-8">
          <button
            className="btn-primary text-lg px-12 py-4"
            onClick={handleStart}
            disabled={isPlaying}
          >
            {isPlaying ? '🎲 추첨 중...' : '🚀 시작하기'}
          </button>
        </div>

        {/* 결과 표시 */}
        {showResults && paths.length > 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-center text-white mb-6">
              🎉 결과 발표
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paths.map((pathData, index) => {
                const participantName = names[pathData.participantIndex] || `참가자${pathData.participantIndex + 1}`
                const prizeName = prizes[pathData.resultIndex] || `경품${pathData.resultIndex + 1}`
                
                return (
                  <div
                    key={`result-${index}`}
                    className="result-card bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20"
                    style={{ 
                      '--delay': `${index * 0.1}s`,
                      borderLeftColor: pathData.color,
                      borderLeftWidth: '4px'
                    } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: pathData.color }}
                      >
                        {pathData.participantIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold truncate">
                          {participantName}
                        </p>
                        <p className="text-amber-400 text-sm flex items-center gap-1">
                          <span>→</span>
                          <span className="truncate">{prizeName}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 푸터 */}
        <footer className="text-center mt-12 text-white/30 text-sm">
          <p>Made with ❤️ for fair random selection</p>
        </footer>
      </div>
    </div>
  )
}

