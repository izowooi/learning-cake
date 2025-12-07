import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export type DifficultyLevel =
  | 'beginner1'       // HSK 1-2급 (아주 쉬움)
  | 'beginner2'       // HSK 2-3급
  | 'intermediate1'   // HSK 3-4급
  | 'intermediate2'   // HSK 4-5급
  | 'advanced'        // HSK 5-6급

export type PassageLength = 'short' | 'medium' | 'long'

export type TopicCategory = 
  | 'humanities' 
  | 'social' 
  | 'science' 
  | 'culture' 
  | 'history' 
  | 'arts' 
  | 'general'
  | 'random'
  | 'custom'

const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  beginner1: 'HSK 1-2 level (absolute beginner). Use very basic vocabulary (100-300 common words) and simple sentence structures like 我是学生, 你好吗. Ideal for absolute beginners.',
  beginner2: 'HSK 2-3 level. Use basic vocabulary (300-600 words) with simple compound sentences and common grammar patterns.',
  intermediate1: 'HSK 3-4 level. Use intermediate vocabulary (600-1200 words) with varied sentence patterns and more complex grammar.',
  intermediate2: 'HSK 4-5 level. Use advanced vocabulary (1200-2500 words) and complex grammatical structures including 把 sentences, complements, etc.',
  advanced: 'HSK 5-6 level. Use sophisticated vocabulary (2500+ words), idioms (成语), and native-level expressions with complex sentence structures.',
}

const LENGTH_CHARS: Record<PassageLength, { min: number; max: number }> = {
  short: { min: 100, max: 150 },
  medium: { min: 200, max: 300 },
  long: { min: 400, max: 500 },
}

export async function generatePassage(params: {
  topic: string
  difficulty: DifficultyLevel
  length: PassageLength
  category?: TopicCategory
}): Promise<{ title: string; content: string; topic: string }> {
  const client = getOpenAIClient()
  const { topic, difficulty, length, category } = params
  const charRange = LENGTH_CHARS[length]
  const difficultyDesc = DIFFICULTY_DESCRIPTIONS[difficulty]

  const systemPrompt = `You are an educational content creator specializing in Chinese learning materials for Korean students.
Create engaging, well-structured passages in Simplified Chinese (简体中文) that are educational and interesting.
Always include a clear title for the passage in Chinese.
The content should be factually accurate and appropriate for the reading level.
Do not include pinyin in the passage - only Chinese characters.`

  const userPrompt = `Create a Chinese passage about "${topic}"${category && category !== 'custom' ? ` in the ${category} category` : ''}.

Requirements:
- Difficulty: ${difficultyDesc}
- Character count: ${charRange.min}-${charRange.max} Chinese characters (excluding punctuation)
- Include a clear title in Chinese
- Structure: Introduction, body paragraphs, conclusion
- Make it engaging and educational
- Use Simplified Chinese (简体中文) only

Respond in JSON format:
{
  "title": "中文标题",
  "content": "完整的中文文章内容"
}`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')

  return {
    title: result.title || topic,
    content: result.content || '',
    topic,
  }
}

export async function generateQuiz(passage: string, title: string): Promise<{
  questions: Array<{
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }>
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert at creating Chinese reading comprehension questions for Korean learners. Create questions in Korean that test understanding of Chinese passages, not just memory.',
      },
      {
        role: 'user',
        content: `Based on this Chinese passage titled "${title}":

${passage}

Create 5 multiple choice questions in Korean. Each question should have 5 options (A-E).
Include questions about main idea, details, vocabulary in context, inference, and purpose.
The questions and options should be in Korean, but may include Chinese words/phrases when necessary for clarity.

Respond in JSON format:
{
  "questions": [
    {
      "question": "한국어로 된 질문 (필요시 중국어 단어 포함)",
      "options": ["선택지 A", "선택지 B", "선택지 C", "선택지 D", "선택지 E"],
      "correctAnswer": 0,
      "explanation": "왜 이 답이 맞는지 한국어로 설명"
    }
  ]
}`,
      },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{"questions":[]}')
}

export async function getWordDefinition(word: string, context?: string): Promise<{
  word: string
  pinyin: string
  partOfSpeech: string
  definition: string
  definitionKorean: string
  chineseDefinition: string
  examples: string[]
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a Chinese dictionary expert. Provide accurate definitions with helpful examples. All Chinese content should be in Simplified Chinese (简体中文).',
      },
      {
        role: 'user',
        content: `Define the Chinese word/phrase "${word}"${context ? ` as used in: "${context}"` : ''}.

Respond in JSON format:
{
  "word": "${word}",
  "pinyin": "拼音 with tone marks (e.g., nǐ hǎo, xuéxí)",
  "partOfSpeech": "품사 in Korean (명사/동사/형용사/부사/etc)",
  "definition": "한국어 뜻",
  "definitionKorean": "한국어 뜻 (상세)",
  "chineseDefinition": "中文释义 (Chinese-Chinese dictionary definition in Simplified Chinese)",
  "examples": ["中文例句1 (한국어 번역)", "中文例句2 (한국어 번역)"]
}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

export async function reviewWriting(
  passage: string,
  userWriting: string,
  passageTitle: string
): Promise<{
  praise: string
  grammarFeedback: Array<{ original: string; suggestion: string; explanation: string }>
  styleSuggestions: string[]
  encouragement: string
  overallScore: number
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a warm and encouraging Chinese teacher reviewing a Korean student's Chinese writing.
Your primary goal is to motivate and encourage while providing helpful feedback.
Always start with genuine praise in Korean. Be specific about what the student did well.
Grammar corrections should be gentle and educational - show the Chinese correction with Korean explanation.
End with encouragement in Korean that motivates continued learning.`,
      },
      {
        role: 'user',
        content: `The student read a Chinese passage titled "${passageTitle}" and wrote their thoughts in Chinese:

Original Passage:
${passage}

Student's Chinese Writing:
${userWriting}

Provide a review in JSON format (feedback in Korean, corrections show Chinese):
{
  "praise": "학생이 잘한 점에 대한 구체적이고 따뜻한 칭찬 (한국어, 2-3문장)",
  "grammarFeedback": [
    {"original": "틀린 중국어 표현", "suggestion": "수정된 중국어 표현", "explanation": "간단한 설명 (한국어)"}
  ],
  "styleSuggestions": ["더 좋은 중국어 표현이나 어휘 제안 (한국어 설명과 함께)"],
  "encouragement": "따뜻한 격려 메시지 (한국어, 2-3문장)",
  "overallScore": 85
}`,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

