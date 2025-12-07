import { NextRequest, NextResponse } from 'next/server'
import { generatePassage, type DifficultyLevel, type PassageLength, type TopicCategory } from '@/lib/ai/openai'
import { verifyApiAuth, unauthorizedResponse } from '@/lib/auth/api-auth'

const RANDOM_TOPICS: Record<TopicCategory, string[]> = {
  humanities: [
    '中国传统哲学思想的现代意义',
    '汉字的起源和演变',
    '中国古代文学的魅力',
  ],
  social: [
    '中国城市化进程与发展',
    '中国互联网文化的特点',
    '中国青年一代的生活方式',
  ],
  science: [
    '中国航天技术的发展历程',
    '中医与现代医学的结合',
    '中国的环保努力与绿色发展',
  ],
  culture: [
    '中国传统节日的意义',
    '中国饮食文化的特色',
    '中国茶文化的历史与现代',
  ],
  history: [
    '丝绸之路的历史意义',
    '中国古代四大发明的影响',
    '长城的建设与历史价值',
  ],
  arts: [
    '中国书法艺术的美学',
    '京剧的魅力与传承',
    '中国传统音乐的特点',
  ],
  general: [
    '学习中文的好处',
    '中国的自然风景名胜',
    '中国现代城市生活',
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

    // Count Chinese characters (excluding punctuation and spaces)
    const wordCount = (passage.content.match(/[\u4e00-\u9fff]/g) || []).length

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

