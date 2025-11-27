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
  | 'elementary'      // 미국 초등학생
  | 'middle_low'      // 미국 중학교 1~2학년
  | 'middle_high'     // 미국 중학교 3학년~고1
  | 'high_school'     // 미국 고등학교 2~3학년
  | 'college'         // 미국 대학생

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
  elementary: 'US elementary school level (grades 3-5). Use simple vocabulary and short sentences.',
  middle_low: 'US middle school level (grades 6-7). Use intermediate vocabulary with some compound sentences.',
  middle_high: 'US middle school to early high school level (grades 8-9). Use varied vocabulary and complex sentences.',
  high_school: 'US high school level (grades 11-12). Use advanced vocabulary and sophisticated sentence structures.',
  college: 'US college level. Use academic vocabulary and complex argumentative structures.',
}

const LENGTH_WORDS: Record<PassageLength, { min: number; max: number }> = {
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
  const wordRange = LENGTH_WORDS[length]
  const difficultyDesc = DIFFICULTY_DESCRIPTIONS[difficulty]

  const systemPrompt = `You are an educational content creator specializing in English learning materials for Korean students.
Create engaging, well-structured passages that are educational and interesting.
Always include a clear title for the passage.
The content should be factually accurate and appropriate for the reading level.`

  const userPrompt = `Create an English passage about "${topic}"${category && category !== 'custom' ? ` in the ${category} category` : ''}.

Requirements:
- Difficulty: ${difficultyDesc}
- Word count: ${wordRange.min}-${wordRange.max} words
- Include a clear title
- Structure: Introduction, body paragraphs, conclusion
- Make it engaging and educational

Respond in JSON format:
{
  "title": "The title of the passage",
  "content": "The full passage content"
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
        content: 'You are an expert at creating reading comprehension questions. Create questions that test understanding, not just memory.',
      },
      {
        role: 'user',
        content: `Based on this passage titled "${title}":

${passage}

Create 5 multiple choice questions. Each question should have 5 options (A-E).
Include questions about main idea, details, vocabulary in context, inference, and purpose.

Respond in JSON format:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
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
  englishDefinition: string
  examples: string[]
}> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a dictionary expert. Provide accurate definitions with helpful examples.',
      },
      {
        role: 'user',
        content: `Define the word "${word}"${context ? ` as used in: "${context}"` : ''}.

Respond in JSON format:
{
  "word": "${word}",
  "pronunciation": "IPA pronunciation",
  "partOfSpeech": "noun/verb/adjective/etc",
  "definition": "Korean definition",
  "definitionKorean": "한국어 뜻",
  "englishDefinition": "English definition (for English-English dictionary)",
  "examples": ["Example sentence 1", "Example sentence 2"]
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
        content: `You are a warm and encouraging English teacher reviewing a Korean student's writing.
Your primary goal is to motivate and encourage while providing helpful feedback.
Always start with genuine praise. Be specific about what the student did well.
Grammar corrections should be gentle and educational.
End with encouragement that motivates continued learning.`,
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

