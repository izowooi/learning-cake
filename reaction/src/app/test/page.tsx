'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useGame } from '@/contexts/GameContext';

type GamePhase = 'waiting' | 'ready' | 'go' | 'result' | 'countdown' | 'tooEarly' | 'done';

export default function TestPage() {
  const { gameState, addResult, nextRound } = useGame();
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isVisible, setIsVisible] = useState(true);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 테마 적용
  useEffect(() => {
    document.body.setAttribute('data-theme', gameState.theme);
  }, [gameState.theme]);

  // 게임 시작
  const startRound = useCallback(() => {
    setPhase('ready');
    setReactionTime(null);
    setIsVisible(true);
    
    // 애니메이션이 켜져 있을 때만 깜빡임 효과 시작
    if (gameState.animationEnabled) {
      blinkIntervalRef.current = setInterval(() => {
        setIsVisible(prev => !prev);
      }, 800);
    }
    
    // 2-5초 랜덤 후 초록색으로 변경
    const randomDelay = 2000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }
      setIsVisible(true);
      setPhase('go');
      startTimeRef.current = performance.now();
    }, randomDelay);
  }, [gameState.animationEnabled]);

  // 컴포넌트 마운트 시 게임 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      startRound();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    };
  }, [startRound]);

  // 원 클릭 처리
  const handleCircleClick = () => {
    if (phase === 'ready') {
      // 너무 빨리 클릭함
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      setPhase('tooEarly');
      setIsVisible(true);
      
      // 2초 후 다시 시작
      setTimeout(() => {
        startRound();
      }, 2000);
    } else if (phase === 'go') {
      // 정상 클릭
      const endTime = performance.now();
      const time = Math.round(endTime - startTimeRef.current);
      setReactionTime(time);
      addResult(time);
      setPhase('result');
      
      // 결과 표시 후 카운트다운 또는 결과 페이지로 이동
      setTimeout(() => {
        if (gameState.currentRound < 2) {
          setPhase('countdown');
          setCountdown(3);
        } else {
          setPhase('done');
        }
      }, 1500);
    }
  };

  // 카운트다운 처리
  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        nextRound();
        startRound();
      }
    }
  }, [phase, countdown, nextRound, startRound]);

  // 화면에 표시할 원의 색상과 내용
  const getCircleContent = () => {
    switch (phase) {
      case 'waiting':
        return { color: 'red', text: '준비...', showText: true };
      case 'ready':
        return { color: 'red', text: '기다리세요...', showText: true };
      case 'go':
        return { color: 'green', text: '터치!', showText: true };
      case 'result':
        return { color: 'green', text: `${reactionTime}ms`, showText: true };
      case 'tooEarly':
        return { color: 'red', text: '', showText: false };
      case 'countdown':
        return { color: 'red', text: '', showText: false };
      default:
        return { color: 'red', text: '', showText: false };
    }
  };

  const circleContent = getCircleContent();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* 라운드 표시 */}
      <div className="absolute top-6 left-6 text-lg font-bold" style={{ color: 'var(--foreground)' }}>
        {gameState.currentRound} / 2
      </div>

      {/* 메인 게임 영역 */}
      <div className="flex flex-col items-center">
        {/* 반응 시간 표시 (결과 상태일 때) */}
        {phase === 'result' && reactionTime !== null && (
          <div 
            className="mb-8 text-4xl md:text-6xl font-bold animate-slide-up"
            style={{ color: 'var(--secondary)' }}
          >
            {reactionTime}ms
          </div>
        )}

        {/* 너무 빨라요 메시지 */}
        {phase === 'tooEarly' && (
          <div 
            className="mb-8 text-center animate-slide-up"
            style={{ color: 'var(--primary)' }}
          >
            <div className="text-2xl md:text-4xl font-bold mb-2">너무 빨라요! 😅</div>
            <div className="text-lg">다시 탭하세요</div>
          </div>
        )}

        {/* 카운트다운 */}
        {phase === 'countdown' && (
          <div 
            className="mb-8 text-6xl md:text-8xl font-bold animate-countdown"
            style={{ color: 'var(--accent)' }}
            key={countdown}
          >
            {countdown > 0 ? countdown : '준비!'}
          </div>
        )}

        {/* 게임 원 */}
        {phase !== 'countdown' && (
          <button
            onClick={handleCircleClick}
            disabled={phase === 'waiting' || phase === 'result'}
            className={`game-circle ${circleContent.color} ${phase === 'go' ? 'active' : ''}`}
            style={{
              opacity: (phase === 'ready' && !isVisible && gameState.animationEnabled) ? 0 : 1,
              transition: (phase === 'ready' && gameState.animationEnabled) ? 'opacity 0.4s ease-in-out' : 'none',
            }}
          >
            {circleContent.showText && (
              <span className="text-white text-xl md:text-2xl font-bold select-none">
                {circleContent.text}
              </span>
            )}
          </button>
        )}

        {/* 안내 문구 */}
        {phase === 'ready' && (
          <p className="mt-8 text-lg opacity-70 animate-blink" style={{ color: 'var(--foreground)' }}>
            초록색으로 바뀌면 터치하세요!
          </p>
        )}

        {phase === 'result' && gameState.currentRound < 2 && (
          <p className="mt-8 text-lg opacity-70" style={{ color: 'var(--foreground)' }}>
            잠시 후 다음 라운드가 시작됩니다...
          </p>
        )}

        {phase === 'result' && gameState.currentRound >= 2 && (
          <p className="mt-8 text-lg opacity-70" style={{ color: 'var(--foreground)' }}>
            결과를 확인하세요...
          </p>
        )}

        {phase === 'done' && (
          <div className="mt-8 text-center animate-slide-up">
            <p className="text-xl mb-4" style={{ color: 'var(--foreground)' }}>
              테스트 완료! 🎉
            </p>
            <Link
              href="/result"
              className="btn-primary text-lg px-8 py-4 inline-block"
            >
              결과 확인하기
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

