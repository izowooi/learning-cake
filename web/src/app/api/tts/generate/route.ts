import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech, type TTSAccent, type TTSProvider } from '@/lib/tts'
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
    const { text, accent, provider } = body as {
      text: string
      accent: TTSAccent
      provider?: TTSProvider
    }

    // Validate required fields
    if (!text || !accent) {
      return NextResponse.json(
        { error: '텍스트와 발음 종류는 필수입니다.' },
        { status: 400 }
      )
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      return NextResponse.json(
        { error: '텍스트가 너무 깁니다. (최대 5000자)' },
        { status: 400 }
      )
    }

    // Generate audio
    const audioBuffer = await synthesizeSpeech({
      text,
      accent,
      speed: 1.0,
      provider: provider || 'openai',
    })

    // Return audio as response
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('TTS generation error:', error)
    return NextResponse.json(
      { error: 'TTS 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

