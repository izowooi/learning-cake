export interface ShareData {
  title: string
  text: string
  url: string
}

/**
 * Web Share API 지원 여부 확인
 * @returns Web Share API 사용 가능 여부
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/**
 * Web Share API를 사용하여 컨텐츠 공유
 * @param data 공유할 데이터 (title, text, url)
 * @returns 공유 결과 ('success' | 'cancelled' | 'error')
 */
export async function shareContent(
  data: ShareData
): Promise<'success' | 'cancelled' | 'error'> {
  if (!isWebShareSupported()) {
    throw new Error('Web Share API not supported')
  }

  try {
    await navigator.share(data)
    return 'success'
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        // 사용자가 공유 취소
        return 'cancelled'
      }
      if (error.name === 'InvalidStateError') {
        // 이전 공유가 아직 진행 중
        console.warn('Share already in progress')
        return 'cancelled'
      }
    }
    console.error('Share failed:', error)
    return 'error'
  }
}

/**
 * 클립보드에 텍스트 복사 (fallback)
 * @param text 복사할 텍스트
 * @returns 복사 성공 여부
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 서버 사이드에서는 실행하지 않음
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  try {
    // 최신 Clipboard API 시도
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback: 임시 textarea 생성
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.width = '2em'
    textarea.style.height = '2em'
    textarea.style.padding = '0'
    textarea.style.border = 'none'
    textarea.style.outline = 'none'
    textarea.style.boxShadow = 'none'
    textarea.style.background = 'transparent'
    textarea.style.opacity = '0'

    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    // iOS Safari 지원
    textarea.setSelectionRange(0, textarea.value.length)

    const success = document.execCommand('copy')
    document.body.removeChild(textarea)

    return success
  } catch (error) {
    console.error('Copy failed:', error)
    return false
  }
}
