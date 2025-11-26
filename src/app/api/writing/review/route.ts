import { NextRequest, NextResponse } from 'next/server'
import { reviewWriting } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { passage, userWriting, title } = body as {
      passage: string
      userWriting: string
      title: string
    }

    if (!passage || !userWriting || !title) {
      return NextResponse.json(
        { error: '지문, 글쓰기 내용, 제목이 필요합니다.' },
        { status: 400 }
      )
    }

    if (userWriting.length < 10) {
      return NextResponse.json(
        { error: '최소 10자 이상 작성해주세요.' },
        { status: 400 }
      )
    }

    const review = await reviewWriting(passage, userWriting, title)

    return NextResponse.json({
      success: true,
      review,
    })
  } catch (error) {
    console.error('Writing review error:', error)
    return NextResponse.json(
      { error: '리뷰 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

