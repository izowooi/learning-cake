// Google Cloud Text-to-Speech integration

export type TTSVoice = 'male' | 'female'
export type TTSSpeed = 0.5 | 1.0 | 1.5 | 2.0

interface TTSOptions {
  text: string
  voice: TTSVoice
  speed?: TTSSpeed
}

// Google Cloud TTS Chinese (Mandarin) voices
// zh-CN-Neural2-D - Male voice
// zh-CN-Neural2-A - Female voice
const VOICE_MAP: Record<TTSVoice, { languageCode: string; name: string }> = {
  male: { languageCode: 'zh-CN', name: 'zh-CN-Neural2-D' },
  female: { languageCode: 'zh-CN', name: 'zh-CN-Neural2-A' },
}

export async function synthesizeSpeechGoogle(options: TTSOptions): Promise<Buffer> {
  const { text, voice, speed = 1.0 } = options
  const voiceConfig = VOICE_MAP[voice]

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
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
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

