import { NextRequest, NextResponse } from 'next/server'
import { generatePassage, type DifficultyLevel, type PassageLength, type TopicCategory } from '@/lib/ai/openai'
import { verifyApiAuth, unauthorizedResponse } from '@/lib/auth/api-auth'

const RANDOM_TOPICS: Record<TopicCategory, string[]> = {
  humanities: [
    'The importance of empathy in human relationships',
    'How storytelling shapes our understanding of the world',
    'The role of philosophy in everyday life',
  ],
  social: [
    'The impact of social media on communication',
    'Why volunteering benefits both communities and individuals',
    'The evolution of education in the digital age',
  ],
  science: [
    'How plants communicate with each other',
    'The mysteries of deep ocean life',
    'Why the sky changes colors during sunset',
  ],
  culture: [
    'The significance of traditional festivals around the world',
    'How food reflects cultural identity',
    'The universal language of music',
  ],
  history: [
    'Ancient inventions that changed the world',
    'The Silk Road: connecting East and West',
    'How the printing press revolutionized knowledge',
  ],
  arts: [
    'The power of colors in visual art',
    'How dance expresses human emotions',
    'The evolution of animation in film',
  ],
  general: [
    'The benefits of learning a second language',
    'Why sleep is essential for health',
    'The science behind making good decisions',
  ],
  random: [],
  custom: [],
}

function getRandomTopic(category: TopicCategory): string {
  if (category === 'random') {
    const allCategories = Object.keys(RANDOM_TOPICS).filter(
      (c) => c !== 'random' && c !== 'custom'
    ) as TopicCategory[]
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)]
    const topics = RANDOM_TOPICS[randomCategory]
    return topics[Math.floor(Math.random() * topics.length)]
  }
  
  const topics = RANDOM_TOPICS[category]
  if (topics.length === 0) return 'An interesting topic'
  return topics[Math.floor(Math.random() * topics.length)]
}

export async function POST(request: NextRequest) {
  // Auth check
  const authResult = verifyApiAuth(request)
  if (!authResult.authorized) {
    return unauthorizedResponse(authResult.error)
  }

  try {
    const body = await request.json()
    const { topic, difficulty, length, category } = body as {
      topic?: string
      difficulty: DifficultyLevel
      length: PassageLength
      category: TopicCategory
    }

    // Validate required fields
    if (!difficulty || !length || !category) {
      return NextResponse.json(
        { error: '난이도, 길이, 카테고리는 필수입니다.' },
        { status: 400 }
      )
    }

    // Get topic (use provided or generate random)
    const finalTopic = topic || getRandomTopic(category)

    // Generate passage using AI
    const passage = await generatePassage({
      topic: finalTopic,
      difficulty,
      length,
      category,
    })

    // Count words
    const wordCount = passage.content.split(/\s+/).filter(Boolean).length

    return NextResponse.json({
      success: true,
      passage: {
        ...passage,
        category,
        difficulty,
        length,
        wordCount,
      },
    })
  } catch (error) {
    console.error('Passage generation error:', error)
    return NextResponse.json(
      { error: '지문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

