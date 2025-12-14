import { NextRequest, NextResponse } from 'next/server'
import { generatePassage, type DifficultyLevel, type PassageLength, type TopicCategory } from '@/lib/ai/openai'
import { verifyApiAuth, unauthorizedResponse } from '@/lib/auth/api-auth'

export const runtime = 'edge'

const RANDOM_TOPICS: Record<TopicCategory, string[]> = {
  humanities: [
    '人間関係における共感の重要性',
    'ストーリーテリングが世界理解に与える影響',
    '日常生活における哲学の役割',
  ],
  social: [
    'SNSがコミュニケーションに与える影響',
    'ボランティア活動が地域社会と個人にもたらす利点',
    'デジタル時代における教育の進化',
  ],
  science: [
    '植物同士のコミュニケーション方法',
    '深海生物の謎',
    '夕焼けで空の色が変わる理由',
  ],
  culture: [
    '世界の伝統的な祭りの意義',
    '食べ物が文化的アイデンティティを反映する方法',
    '音楽という世界共通の言語',
  ],
  history: [
    '世界を変えた古代の発明',
    'シルクロード：東西を結ぶ道',
    '印刷技術が知識を革命化した方法',
  ],
  arts: [
    '視覚芸術における色の力',
    'ダンスが人間の感情を表現する方法',
    '映画におけるアニメーションの進化',
  ],
  general: [
    '第二言語を学ぶ利点',
    '睡眠が健康に不可欠な理由',
    '良い決断をするための科学',
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
  if (topics.length === 0) return '興味深いトピック'
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

    // Count characters (excluding whitespace for Japanese)
    const wordCount = passage.content.replace(/\s/g, '').length

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

