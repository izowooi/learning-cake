import { getOpenAIClient } from '../ai/openai'

export type TTSAccent = 'male' | 'female'
export type TTSSpeed = 0.5 | 1.0 | 1.5 | 2.0

interface TTSOptions {
  text: string
  accent: TTSAccent
  speed?: TTSSpeed
}

// OpenAI TTS voices for Japanese
// 'onyx' - deep male voice
// 'nova' - warm female voice
const VOICE_MAP: Record<TTSAccent, string> = {
  male: 'onyx',
  female: 'nova',
}

export async function synthesizeSpeechOpenAI(options: TTSOptions): Promise<Buffer> {
  const { text, accent, speed = 1.0 } = options
  const client = getOpenAIClient()
  const voice = VOICE_MAP[accent]

  const response = await client.audio.speech.create({
    model: 'tts-1',
    voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
    input: text,
    speed: speed,
    response_format: 'mp3',
  })

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

