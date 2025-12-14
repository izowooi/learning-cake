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
  | 'n5'    // JLPT N5 (초급)
  | 'n4'    // JLPT N4 (초중급)
  | 'n3'    // JLPT N3 (중급)
  | 'n2'    // JLPT N2 (중상급)
  | 'n1'    // JLPT N1 (상급)

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
  n5: 'JLPT N5 level. Use basic hiragana, katakana, and simple kanji (around 100 kanji). Use simple sentence patterns like です/ます form. Vocabulary should be basic everyday words (around 800 words).',
  n4: 'JLPT N4 level. Use basic kanji (around 300 kanji). Include more varied sentence structures. Vocabulary should be around 1,500 words including basic daily life terms.',
  n3: 'JLPT N3 level. Use intermediate kanji (around 650 kanji). Include compound sentences and various grammatical patterns. Vocabulary should be around 3,750 words.',
  n2: 'JLPT N2 level. Use advanced kanji (around 1,000 kanji). Include complex sentence structures and formal expressions. Vocabulary should be around 6,000 words.',
  n1: 'JLPT N1 level. Use advanced kanji (around 2,000 kanji). Include sophisticated expressions, idioms, and formal/informal variations. Vocabulary should exceed 10,000 words.',
}

const LENGTH_CHARS: Record<PassageLength, { min: number; max: number }> = {
  short: { min: 100, max: 200 },
  medium: { min: 300, max: 500 },
  long: { min: 600, max: 800 },
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

  const systemPrompt = `You are an educational content creator specializing in Japanese learning materials for Korean students.
Create engaging, well-structured passages in Japanese that are educational and interesting.
Always include a clear title for the passage in Japanese.
The content should be factually accurate and appropriate for the JLPT reading level.
Use appropriate kanji with furigana notation in parentheses when needed for the specified difficulty level.`

  const userPrompt = `Create a Japanese passage about "${topic}"${category && category !== 'custom' ? ` in the ${category} category` : ''}.

Requirements:
- Difficulty: ${difficultyDesc}
- Character count: ${charRange.min}-${charRange.max} characters (including kanji)
- Include a clear title in Japanese
- Structure: Introduction, body paragraphs, conclusion
- Make it engaging and educational
- For kanji above the specified JLPT level, provide furigana in parentheses like 漢字(かんじ)

Respond in JSON format:
{
  "title": "日本語のタイトル",
  "content": "日本語の本文"
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
        content: 'You are an expert at creating Japanese reading comprehension questions for Korean learners. Create questions in Korean that test understanding of the Japanese passage. Questions and options should be in Korean, but may reference Japanese text from the passage.',
      },
      {
        role: 'user',
        content: `Based on this Japanese passage titled "${title}":

${passage}

Create 5 multiple choice questions in Korean. Each question should have 5 options (A-E).
Include questions about main idea, details, vocabulary in context, inference, and purpose.
Questions and all options must be written in Korean.

Respond in JSON format:
{
  "questions": [
    {
      "question": "질문 텍스트 (한국어)",
      "options": ["선택지 A", "선택지 B", "선택지 C", "선택지 D", "선택지 E"],
      "correctAnswer": 0,
      "explanation": "정답인 이유 (한국어)"
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
  pronunciation: string
  partOfSpeech: string
  definition: string
  definitionKorean: string
  japaneseDefinition: string
  examples: string[]
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a Japanese dictionary expert. Provide accurate definitions with helpful examples for Korean learners studying Japanese.',
      },
      {
        role: 'user',
        content: `Define the Japanese word "${word}"${context ? ` as used in: "${context}"` : ''}.

Respond in JSON format:
{
  "word": "${word}",
  "pronunciation": "히라가나 읽기 (예: よみかた)",
  "partOfSpeech": "품사 (명사/동사/형용사 등)",
  "definition": "한국어 뜻",
  "definitionKorean": "한국어 상세 설명",
  "japaneseDefinition": "日本語での説明",
  "examples": ["例文1 - 한국어 번역", "例文2 - 한국어 번역"]
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
        content: `You are a warm and encouraging Japanese teacher reviewing a Korean student's Japanese writing.
Your primary goal is to motivate and encourage while providing helpful feedback.
Always start with genuine praise. Be specific about what the student did well.
Grammar corrections should be gentle and educational, explaining Japanese grammar points.
End with encouragement that motivates continued learning.
All feedback should be written in Korean for the Korean student.`,
      },
      {
        role: 'user',
        content: `The student read a passage titled "${passageTitle}" and wrote their thoughts:

Original Passage:
${passage}

Student's Writing:
${userWriting}

Provide a review in JSON format:
{
  "praise": "Specific, warm praise for what the student did well (2-3 sentences)",
  "grammarFeedback": [
    {"original": "incorrect phrase", "suggestion": "corrected phrase", "explanation": "brief explanation"}
  ],
  "styleSuggestions": ["Suggestion for better expression or vocabulary"],
  "encouragement": "Warm closing encouragement (2-3 sentences)",
  "overallScore": 85
}`,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

