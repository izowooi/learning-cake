import { synthesizeSpeechGoogle } from './google'
import { synthesizeSpeechOpenAI } from './openai'
import { uploadAudio, generateAudioFileName } from '../storage/r2'

export type TTSProvider = 'google' | 'openai'
export type TTSAccent = 'us' | 'uk'
export type TTSSpeed = 0.5 | 1.0 | 1.5 | 2.0

interface TTSOptions {
  text: string
  accent: TTSAccent
  speed?: TTSSpeed
  provider?: TTSProvider
}

export async function synthesizeSpeech(options: TTSOptions): Promise<Buffer> {
  const { provider = 'openai', ...ttsOptions } = options

  if (provider === 'google') {
    return synthesizeSpeechGoogle(ttsOptions)
  }
  
  return synthesizeSpeechOpenAI(ttsOptions)
}

export async function generateAndStoreAudio(
  passageId: string,
  text: string,
  accent: TTSAccent,
  provider: TTSProvider = 'openai'
): Promise<string> {
  // Generate audio
  const audioBuffer = await synthesizeSpeech({
    text,
    accent,
    speed: 1.0,
    provider,
  })

  // Upload to R2
  const fileName = generateAudioFileName(passageId, accent)
  const audioUrl = await uploadAudio(audioBuffer, fileName)

  return audioUrl
}

export type { TTSAccent as Accent, TTSSpeed as Speed }

