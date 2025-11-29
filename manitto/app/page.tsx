'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createGroup, findGroupByNameAndLeader } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim() || !leaderName.trim()) {
      setError('그룹명과 리더 이름을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    // 중복 체크
    const existingGroup = findGroupByNameAndLeader(groupName.trim(), leaderName.trim());
    if (existingGroup) {
      setError(`이미 "${groupName}" 그룹의 "${leaderName}" 리더가 존재합니다.`);
      setIsLoading(false);
      return;
    }

    // 그룹 생성
    const newGroup = createGroup({
      groupName: groupName.trim(),
      leaderName: leaderName.trim(),
    });

    // 이름 입력 페이지로 이동
    router.push(`/group?id=${newGroup.id}`);
  };

  return (
    <div className="animate-fadeIn">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4 animate-bounce-gentle">🎁</div>
        <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">마니또</h1>
        <p className="text-[var(--foreground)]/70">비밀 친구를 만들어보세요!</p>
      </div>

      {/* 메인 카드 */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
        <h2 className="text-xl font-semibold mb-6 text-center">새 그룹 만들기</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium mb-2">
              그룹명
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 개발팀 마니또"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            />
          </div>

          <div>
            <label htmlFor="leaderName" className="block text-sm font-medium mb-2">
              리더 이름
            </label>
            <input
              type="text"
              id="leaderName"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isLoading ? '생성 중...' : '그룹 생성'}
          </button>
        </form>
      </div>

      {/* 관리자 페이지 링크 */}
      <div className="text-center">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          관리자 페이지
        </Link>
      </div>
    </div>
  );
}
