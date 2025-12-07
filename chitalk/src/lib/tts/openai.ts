import { getOpenAIClient } from '../ai/openai'

export type TTSVoice = 'male' | 'female'
export type TTSSpeed = 0.5 | 1.0 | 1.5 | 2.0

interface TTSOptions {
  text: string
  voice: TTSVoice
  speed?: TTSSpeed
}

// OpenAI TTS voices for Chinese
// 'onyx' - deep male voice
// 'nova' - female voice
const VOICE_MAP: Record<TTSVoice, string> = {
  male: 'onyx',
  female: 'nova',
}

export async function synthesizeSpeechOpenAI(options: TTSOptions): Promise<Buffer> {
  const { text, voice, speed = 1.0 } = options
  const client = getOpenAIClient()
  const voiceName = VOICE_MAP[voice]

  const response = await client.audio.speech.create({
    model: 'tts-1',
    voice: voiceName as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
    input: text,
    speed: speed,
    response_format: 'mp3',
  })

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

