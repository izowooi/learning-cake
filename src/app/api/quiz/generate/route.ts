import { NextRequest, NextResponse } from 'next/server'
import { generateQuiz } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
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

