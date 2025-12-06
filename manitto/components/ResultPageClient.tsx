'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGroupById } from '@/lib/firebase-storage';
import { Group } from '@/lib/types';
import MatchingResult from '@/components/MatchingResult';

interface ResultPageClientProps {
  groupId: string;
}

export default function ResultPageClient({ groupId }: ResultPageClientProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const loadedGroup = await getGroupById(groupId);
        if (loadedGroup) {
          setGroup(loadedGroup);
        }
      } catch (err) {
        console.error('Failed to load group:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGroup();
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-xl font-semibold mb-2">그룹을 찾을 수 없습니다</h2>
        <p className="text-[var(--foreground)]/60 mb-6">존재하지 않거나 삭제된 그룹입니다.</p>
        <Link
          href="/"
          className="inline-block bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold py-2 px-6 rounded-xl transition-all"
        >
          메인으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!group.matchings || group.matchings.length === 0) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <div className="text-6xl mb-4">🤔</div>
        <h2 className="text-xl font-semibold mb-2">아직 매칭이 완료되지 않았습니다</h2>
        <p className="text-[var(--foreground)]/60 mb-6">참가자를 추가하고 매칭을 시작해주세요.</p>
        <Link
          href={`/group/${groupId}`}
          className="inline-block bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold py-2 px-6 rounded-xl transition-all"
        >
          참가자 추가하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* 네비게이션 */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block text-[var(--foreground)]/60 hover:text-[var(--primary)] mb-4 transition-colors">
          ← 메인으로
        </Link>
      </div>

      {/* 매칭 결과 */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 border border-[var(--border)]">
        <MatchingResult
          matchings={group.matchings}
          leaderName={group.leaderName}
          groupName={group.groupName}
        />
      </div>

      {/* 버튼들 */}
      <div className="mt-6 space-y-3">
        <Link
          href={`/group/${groupId}`}
          className="block w-full bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-white font-semibold py-3 px-6 rounded-xl transition-all text-center"
        >
          참가자 관리로 돌아가기
        </Link>
        <Link
          href="/"
          className="block w-full bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 text-[var(--foreground)] font-semibold py-3 px-6 rounded-xl transition-all text-center"
        >
          새 그룹 만들기
        </Link>
      </div>

      {/* 비밀번호 안내 */}
      <div className="mt-6 text-center text-sm text-[var(--foreground)]/50">
        <p>그룹 비밀번호: <span className="font-semibold text-[var(--secondary)]">{group.password}</span></p>
        <p className="mt-1">관리자 페이지에서 이 비밀번호로 결과를 다시 확인할 수 있습니다.</p>
      </div>
    </div>
  );
}

