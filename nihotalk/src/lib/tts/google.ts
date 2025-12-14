// Google Cloud Text-to-Speech integration

export type TTSAccent = 'male' | 'female'
export type TTSSpeed = 0.5 | 1.0 | 1.5 | 2.0

interface TTSOptions {
  text: string
  accent: TTSAccent
  speed?: TTSSpeed
}

// Google Cloud TTS Japanese voices
// ja-JP-Neural2-C - male voice
// ja-JP-Neural2-B - female voice
const VOICE_MAP: Record<TTSAccent, { languageCode: string; name: string }> = {
  male: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-C' },
  female: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B' },
}

export async function synthesizeSpeechGoogle(options: TTSOptions): Promise<Buffer> {
  const { text, accent, speed = 1.0 } = options
  const voice = VOICE_MAP[accent]

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: voice.languageCode,
          name: voice.name,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speed,
          pitch: 0,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Google TTS error: ${response.statusText}`)
  }

  const data = await response.json()
  return Buffer.from(data.audioContent, 'base64')
}

