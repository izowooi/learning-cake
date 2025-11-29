'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/contexts/GameContext';

// 등급 계산 함수
function calculateGrade(avgTime: number): { stars: number; label: string; emoji: string } {
  if (avgTime <= 200) return { stars: 5, label: '초인적인 반응속도!', emoji: '🏆' };
  if (avgTime <= 260) return { stars: 4, label: '매우 빠름!', emoji: '⚡' };
  if (avgTime <= 350) return { stars: 3, label: '평균 이상!', emoji: '👍' };
  if (avgTime <= 500) return { stars: 2, label: '평균 수준', emoji: '😊' };
  return { stars: 1, label: '조금 느려요', emoji: '🐢' };
}

// 별 컴포넌트
function Star({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <span
      className="inline-block text-3xl md:text-5xl animate-star"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
      }}
    >
      {filled ? '⭐' : '☆'}
    </span>
  );
}

export default function ResultPage() {
  const { gameState, resetGame } = useGame();
  const [showStars, setShowStars] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // 테마 적용
  useEffect(() => {
    document.body.setAttribute('data-theme', gameState.theme);
    setIsLoaded(true);
    
    // 별 애니메이션 딜레이
    const timer = setTimeout(() => {
      setShowStars(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [gameState.theme]);

  // 결과가 없으면 홈으로 리다이렉트 플래그 설정
  useEffect(() => {
    if (isLoaded && gameState.results.length < 2) {
      setShouldRedirect(true);
    }
  }, [isLoaded, gameState.results]);

  // 리다이렉트가 필요한 경우 홈 링크 표시
  if (shouldRedirect) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <p className="text-xl mb-4" style={{ color: 'var(--foreground)' }}>
            테스트 결과가 없습니다.
          </p>
          <Link
            href="/"
            className="btn-primary text-lg px-8 py-4 inline-block"
          >
            처음으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!isLoaded || gameState.results.length < 2) {
    return null;
  }

  const avgTime = Math.round(gameState.results.reduce((a, b) => a + b, 0) / gameState.results.length);
  const grade = calculateGrade(avgTime);

  const handleReset = () => {
    resetGame();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="card p-8 md:p-12 max-w-lg w-full text-center">
        {/* 제목 */}
        <h1 
          className="text-2xl md:text-4xl font-bold mb-8 animate-slide-up"
          style={{ color: 'var(--foreground)' }}
        >
          테스트 결과 📊
        </h1>

        {/* 개별 결과 */}
        <div className="mb-8 space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {gameState.results.map((time, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-4 rounded-lg"
              style={{ 
                background: 'rgba(var(--foreground-rgb), 0.05)',
                backgroundColor: 'var(--card-bg, rgba(0,0,0,0.05))',
              }}
            >
              <span style={{ color: 'var(--foreground)' }}>
                {index + 1}차 시도
              </span>
              <span 
                className="font-bold text-xl"
                style={{ color: 'var(--accent)' }}
              >
                {time}ms
              </span>
            </div>
          ))}
        </div>

        {/* 평균 속도 */}
        <div 
          className="mb-8 p-6 rounded-xl animate-slide-up"
          style={{ 
            animationDelay: '200ms',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          }}
        >
          <div className="text-white text-sm mb-2">평균 반응속도</div>
          <div className="text-white text-4xl md:text-6xl font-bold">
            {avgTime}ms
          </div>
        </div>

        {/* 별점 */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex justify-center gap-2 mb-4">
            {showStars && [1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                filled={star <= grade.stars} 
                delay={star * 150}
              />
            ))}
          </div>
          <div 
            className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2"
            style={{ color: 'var(--foreground)' }}
          >
            <span>{grade.emoji}</span>
            <span>{grade.label}</span>
          </div>
        </div>

        {/* 등급 설명 */}
        <div 
          className="mb-8 text-sm opacity-60 animate-slide-up"
          style={{ animationDelay: '400ms', color: 'var(--foreground)' }}
        >
          <p>일반인 평균: 200~250ms</p>
          <p>프로게이머: 150~180ms</p>
        </div>

        {/* 버튼 */}
        <div 
          className="flex flex-col md:flex-row gap-4 animate-slide-up"
          style={{ animationDelay: '500ms' }}
        >
          <Link
            href="/test"
            onClick={handleReset}
            className="btn-primary flex-1 text-lg text-center"
          >
            다시 도전하기 🔄
          </Link>
          <Link
            href="/"
            onClick={handleReset}
            className="btn-secondary flex-1 text-lg text-center"
          >
            처음으로 🏠
          </Link>
        </div>
      </div>
    </main>
  );
}

