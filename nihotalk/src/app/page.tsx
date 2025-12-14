'use client'

import { ProtectedPage } from '@/components/ProtectedPage'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  return (
    <ProtectedPage>
      <HomeContent />
    </ProtectedPage>
  )
}

function HomeContent() {
  const { logout } = useAuth()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 bg-clip-text text-transparent">
            NihoTalk
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-4">
            🎌 일본어 학습을 맛있게!
          </p>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            AI가 생성한 맞춤형 지문으로 읽기, 듣기, 단어, 문제, 쓰기까지<br />
            한 번에 학습하세요.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon="📖"
            title="읽기"
            description="원하는 주제와 수준으로 AI가 맞춤 지문을 생성"
          />
          <FeatureCard
            icon="🎧"
            title="듣기"
            description="남자/여자 음성으로 다양한 속도 지원"
          />
          <FeatureCard
            icon="📝"
            title="단어"
            description="모르는 단어를 클릭하면 자동으로 단어장에 저장"
          />
          <FeatureCard
            icon="❓"
            title="문제"
            description="지문 기반 5지선다 객관식 문제로 이해도 확인"
          />
          <FeatureCard
            icon="✍️"
            title="쓰기"
            description="자신의 생각을 쓰고 AI 리뷰로 실력 향상"
          />
          <FeatureCard
            icon="🏆"
            title="게임"
            description="포인트와 업적으로 재미있게 학습"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/study"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-bounce-subtle"
          >
            학습 시작하기
          </a>
          <a
            href="/profile"
            className="inline-block px-8 py-4 border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-semibold text-lg rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transform hover:-translate-y-1 transition-all duration-300"
          >
            내 프로필 👤
          </a>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={logout}
            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* Status Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          모든 기능 사용 가능
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-200/50 dark:border-slate-700/50">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  )
}
