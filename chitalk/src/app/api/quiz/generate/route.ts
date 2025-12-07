import { NextRequest, NextResponse } from 'next/server'
import { generateQuiz } from '@/lib/ai/openai'
import { verifyApiAuth, unauthorizedResponse } from '@/lib/auth/api-auth'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  // Auth check
  const authResult = verifyApiAuth(request)
  if (!authResult.authorized) {
    return unauthorizedResponse(authResult.error)
  }

  try {
    const body = await request.json()
    const { passage, title } = body as {
      passage: string
      title: string
    }

    if (!passage || !title) {
      return NextResponse.json(
        { error: '지문과 제목이 필요합니다.' },
        { status: 400 }
      )
    }

    const quiz = await generateQuiz(passage, title)

    return NextResponse.json({
      success: true,
      quiz,
    })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: '퀴즈 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

