import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body as { password: string }

    if (!password) {
      return NextResponse.json(
        { success: false, error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const correctPassword = process.env.ACCESS_PASSWORD

    if (!correctPassword) {
      console.error('ACCESS_PASSWORD is not set in environment variables')
      return NextResponse.json(
        { success: false, error: '서버 설정 오류입니다.' },
        { status: 500 }
      )
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: '비밀번호가 틀렸습니다.' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Auth verify error:', error)
    return NextResponse.json(
      { success: false, error: '인증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

