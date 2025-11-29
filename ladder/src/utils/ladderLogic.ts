// 참가자별 고유 색상
export const PARTICIPANT_COLORS = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 청록
  '#FFE66D', // 노랑
  '#95E1D3', // 민트
  '#F38181', // 코랄
  '#AA96DA', // 라벤더
  '#FCBAD3', // 핑크
  '#A8D8EA', // 하늘
  '#FF9F43', // 주황
  '#26DE81', // 연두
  '#FD79A8', // 핫핑크
  '#00CEC9', // 틸
  '#FDCB6E', // 골드
  '#6C5CE7', // 보라
  '#00B894', // 에메랄드
]

export interface HorizontalLine {
  row: number
  col: number // 왼쪽 수직선의 인덱스 (col과 col+1을 연결)
}

export interface LadderPath {
  participantIndex: number
  path: { x: number; y: number }[]
  resultIndex: number
  color: string
}

/**
 * 랜덤 가로선 생성
 * 규칙: 같은 row에서 연속된 가로선은 생성하지 않음
 */
export function generateHorizontalLines(
  participantCount: number,
  rowCount: number = 10
): HorizontalLine[] {
  const lines: HorizontalLine[] = []
  
  for (let row = 0; row < rowCount; row++) {
    // 각 행에서 가로선을 배치할 수 있는 위치들
    const availableCols: number[] = []
    
    for (let col = 0; col < participantCount - 1; col++) {
      // 이전 열에 이미 가로선이 있으면 스킵 (연속 방지)
      const prevLineExists = lines.some(
        line => line.row === row && line.col === col - 1
      )
      if (!prevLineExists) {
        availableCols.push(col)
      }
    }
    
    // 랜덤하게 일부 위치에만 가로선 생성 (40~60% 확률)
    for (const col of availableCols) {
      if (Math.random() < 0.5) {
        // 연속 가로선 방지: 방금 추가한 가로선 오른쪽에는 추가하지 않음
        const justAddedLeft = lines.some(
          line => line.row === row && line.col === col - 1
        )
        if (!justAddedLeft) {
          lines.push({ row, col })
        }
      }
    }
  }
  
  return lines
}

/**
 * 사다리 경로 계산
 */
export function calculatePaths(
  participantCount: number,
  horizontalLines: HorizontalLine[],
  rowCount: number = 10
): LadderPath[] {
  const paths: LadderPath[] = []
  
  for (let i = 0; i < participantCount; i++) {
    const path: { x: number; y: number }[] = []
    let currentCol = i
    
    // 시작점
    path.push({ x: currentCol, y: 0 })
    
    // 각 행을 순회하며 경로 계산
    for (let row = 0; row < rowCount; row++) {
      // 현재 위치에서 오른쪽으로 가는 가로선이 있는지 확인
      const rightLine = horizontalLines.find(
        line => line.row === row && line.col === currentCol
      )
      
      // 현재 위치에서 왼쪽으로 가는 가로선이 있는지 확인
      const leftLine = horizontalLines.find(
        line => line.row === row && line.col === currentCol - 1
      )
      
      if (rightLine) {
        // 오른쪽으로 이동
        path.push({ x: currentCol, y: row + 0.5 })
        currentCol += 1
        path.push({ x: currentCol, y: row + 0.5 })
      } else if (leftLine) {
        // 왼쪽으로 이동
        path.push({ x: currentCol, y: row + 0.5 })
        currentCol -= 1
        path.push({ x: currentCol, y: row + 0.5 })
      }
      
      // 다음 행으로 이동
      path.push({ x: currentCol, y: row + 1 })
    }
    
    paths.push({
      participantIndex: i,
      path,
      resultIndex: currentCol,
      color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
    })
  }
  
  return paths
}

/**
 * SVG 경로 문자열 생성
 */
export function createPathString(
  path: { x: number; y: number }[],
  ladderWidth: number,
  ladderHeight: number,
  participantCount: number,
  rowCount: number
): string {
  const colWidth = ladderWidth / (participantCount - 1 || 1)
  const rowHeight = ladderHeight / rowCount
  
  return path
    .map((point, index) => {
      const x = point.x * colWidth
      const y = point.y * rowHeight
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

/**
 * 경로의 실제 픽셀 길이 계산
 */
export function calculatePathLength(
  path: { x: number; y: number }[],
  ladderWidth: number,
  ladderHeight: number,
  participantCount: number,
  rowCount: number
): number {
  const colWidth = ladderWidth / (participantCount - 1 || 1)
  const rowHeight = ladderHeight / rowCount
  
  let totalLength = 0
  
  for (let i = 1; i < path.length; i++) {
    const prevX = path[i - 1].x * colWidth
    const prevY = path[i - 1].y * rowHeight
    const currX = path[i].x * colWidth
    const currY = path[i].y * rowHeight
    
    // 두 점 사이의 거리 계산
    const dx = currX - prevX
    const dy = currY - prevY
    totalLength += Math.sqrt(dx * dx + dy * dy)
  }
  
  return totalLength
}

