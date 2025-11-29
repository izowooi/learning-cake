'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGame, Theme } from '@/contexts/GameContext';

const themes: { id: Theme; name: string; description: string; emoji: string }[] = [
  { id: 'minimal', name: '미니멀', description: '깔끔하고 모던한 디자인', emoji: '✨' },
  { id: 'neon', name: '네온', description: '사이버펑크 감성', emoji: '🌃' },
];

export default function Home() {
  const { gameState, setTheme, setAnimationEnabled, resetGame } = useGame();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(gameState.theme);
  const [animationOn, setAnimationOn] = useState(gameState.animationEnabled);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    resetGame();
    setIsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', selectedTheme);
    setTheme(selectedTheme);
  }, [selectedTheme, setTheme]);

  useEffect(() => {
    setAnimationEnabled(animationOn);
  }, [animationOn, setAnimationEnabled]);

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="card p-8 md:p-12 max-w-2xl w-full text-center animate-fade-in">
        {/* 제목 */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          반응속도 테스트
        </h1>
        
        {/* 설명 */}
        <p className="text-lg md:text-xl mb-8 opacity-80" style={{ color: 'var(--foreground)' }}>
          당신의 반응속도를 테스트해보세요! 🎯
        </p>

        {/* 테마 선택 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            테마 선택
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`theme-card ${theme.id}-preview ${selectedTheme === theme.id ? 'selected' : ''}`}
              >
                <div className="text-2xl mb-2">{theme.emoji}</div>
                <div className="font-bold text-sm md:text-base">{theme.name}</div>
                <div className="text-xs opacity-70 mt-1 hidden md:block">{theme.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 애니메이션 토글 */}
        <div className="mb-8">
          <div 
            className="flex items-center justify-center gap-4 p-4 rounded-xl"
            style={{ background: 'var(--card-bg, rgba(0,0,0,0.05))' }}
          >
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--foreground)', opacity: animationOn ? 0.5 : 1 }}
            >
              애니메이션 OFF
            </span>
            <button
              onClick={() => setAnimationOn(!animationOn)}
              className="relative w-14 h-8 rounded-full transition-colors duration-200"
              style={{ 
                background: animationOn ? 'var(--accent)' : 'var(--foreground)',
                opacity: animationOn ? 1 : 0.3
              }}
            >
              <div
                className="absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200"
                style={{ 
                  transform: animationOn ? 'translateX(28px)' : 'translateX(4px)'
                }}
              />
            </button>
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--foreground)', opacity: animationOn ? 1 : 0.5 }}
            >
              애니메이션 ON
            </span>
          </div>
          <p className="text-xs mt-2 opacity-50" style={{ color: 'var(--foreground)' }}>
            {animationOn ? '빨간 원이 깜빡입니다' : '정확한 측정을 위해 애니메이션이 꺼져있습니다'}
          </p>
        </div>

        {/* 시작 버튼 */}
        <Link
          href="/test"
          className="btn-primary text-lg md:text-xl w-full md:w-auto px-12 py-4 inline-block text-center"
        >
          시작하기 🚀
        </Link>

        {/* 안내 */}
        <div className="mt-8 text-sm opacity-60" style={{ color: 'var(--foreground)' }}>
          <p>원이 초록색으로 바뀌면 최대한 빠르게 터치하세요!</p>
          <p className="mt-1">총 2회 테스트를 진행합니다.</p>
        </div>
      </div>
    </main>
  );
}
