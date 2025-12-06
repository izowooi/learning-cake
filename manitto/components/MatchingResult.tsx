'use client';

import { Matching } from '@/lib/types';

interface MatchingResultProps {
  matchings: Matching[];
  leaderName: string;
  groupName: string;
}

export default function MatchingResult({ matchings, leaderName, groupName }: MatchingResultProps) {
  return (
    <div className="animate-fadeIn">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-[var(--primary)]">전체 결과</h2>
      </div>

      {/* 그룹 정보 */}
      <div className="text-center mb-6 text-[var(--foreground)]/70">
        <p>
          리더: <span className="font-semibold text-[var(--foreground)]">{leaderName}</span>
          {' | '}
          그룹명: <span className="font-semibold text-[var(--foreground)]">{groupName}</span>
        </p>
      </div>

      {/* 매칭 결과 리스트 */}
      <div className="space-y-3">
        {matchings.map((matching, index) => (
          <div
            key={index}
            className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border)] shadow-sm animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-center gap-4">
              <span className="font-semibold text-lg text-[var(--secondary)]">
                {matching.from}
              </span>
              <span className="text-2xl">➡️</span>
              <span className="font-semibold text-lg text-[var(--accent)]">
                {matching.to}
              </span>
            </div>
            {matching.matchingPassword && (
              <div className="mt-2 text-center">
                <span className="text-xs text-[var(--foreground)]/60">
                  매칭 비밀번호:{' '}
                </span>
                <span className="text-sm font-semibold text-[var(--primary)]">
                  {matching.matchingPassword}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 text-center text-sm text-[var(--foreground)]/50">
        <p>각 참가자가 화살표 방향의 사람에게 마니또가 됩니다 💝</p>
      </div>
    </div>
  );
}

