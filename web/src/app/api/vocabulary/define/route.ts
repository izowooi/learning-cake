import { NextRequest, NextResponse } from 'next/server'
import { getWordDefinition } from '@/lib/ai/openai'
import { verifyApiAuth, unauthorizedResponse } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  // Auth check
  const authResult = verifyApiAuth(request)
  if (!authResult.authorized) {
    return unauthorizedResponse(authResult.error)
  }

  try {
    const body = await request.json()
    const { word, context } = body as {
      word: string
      context?: string
    }

    if (!word) {
      return NextResponse.json(
        { error: '단어를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Clean the word
    const cleanWord = word.trim().toLowerCase().replace(/[^a-z'-]/g, '')
    
    if (!cleanWord) {
      return NextResponse.json(
        { error: '유효한 영어 단어를 입력해주세요.' },
        { status: 400 }
      )
    }

    const definition = await getWordDefinition(cleanWord, context)

    return NextResponse.json({
      success: true,
      definition,
    })
  } catch (error) {
    console.error('Vocabulary definition error:', error)
    return NextResponse.json(
      { error: '단어 정의를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

