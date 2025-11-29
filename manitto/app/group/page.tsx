'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getGroupById, addMember, updateMember, removeMember, saveMatchings } from '@/lib/storage';
import { createCircularMatching } from '@/lib/matching';
import { Group } from '@/lib/types';
import MemberList from '@/components/MemberList';

function GroupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('id') || '';

  const [group, setGroup] = useState<Group | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      const loadedGroup = getGroupById(groupId);
      if (loadedGroup) {
        setGroup(loadedGroup);
      }
    }
    setIsLoading(false);
  }, [groupId]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = newMemberName.trim();
    if (!name) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (group?.members.includes(name)) {
      setError('이미 추가된 이름입니다.');
      return;
    }

    const updatedGroup = addMember(groupId, name);
    if (updatedGroup) {
      setGroup(updatedGroup);
      setNewMemberName('');
    }
  };

  const handleUpdateMember = (oldName: string, newName: string) => {
    if (group?.members.includes(newName) && oldName !== newName) {
      setError('이미 존재하는 이름입니다.');
      return;
    }

    const updatedGroup = updateMember(groupId, oldName, newName);
    if (updatedGroup) {
      setGroup(updatedGroup);
      setError('');
    }
  };

  const handleDeleteMember = (name: string) => {
    const updatedGroup = removeMember(groupId, name);
    if (updatedGroup) {
      setGroup(updatedGroup);
    }
  };

  const handleStartMatching = () => {
    if (!group || group.members.length < 2) {
      setError('매칭을 시작하려면 최소 2명이 필요합니다.');
      return;
    }

    try {
      const matchings = createCircularMatching(group.members);
      const updatedGroup = saveMatchings(groupId, matchings);
      if (updatedGroup) {
        router.push(`/result?id=${groupId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '매칭 중 오류가 발생했습니다.');
    }
  };

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

  if (!groupId || !group) {
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

  return (
    <div className="animate-fadeIn">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block text-[var(--foreground)]/60 hover:text-[var(--primary)] mb-4 transition-colors">
          ← 메인으로
        </Link>
        <div className="text-4xl mb-3">👥</div>
        <h1 className="text-2xl font-bold text-[var(--primary)] mb-1">{group.groupName}</h1>
        <p className="text-[var(--foreground)]/70">리더: {group.leaderName}</p>
      </div>

      {/* 비밀번호 표시 */}
      <div className="bg-[var(--secondary)]/10 rounded-xl p-4 mb-6 text-center border border-[var(--secondary)]/30">
        <p className="text-sm text-[var(--foreground)]/70 mb-1">그룹 비밀번호</p>
        <p className="text-xl font-bold text-[var(--secondary)]">{group.password}</p>
        <p className="text-xs text-[var(--foreground)]/50 mt-2">이 비밀번호로 관리자 페이지에서 결과를 확인할 수 있습니다</p>
      </div>

      {/* 이름 추가 폼 */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">참가자 추가</h2>
        
        <form onSubmit={handleAddMember} className="flex gap-3">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="이름 입력"
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
          />
          <button
            type="submit"
            className="bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-white font-semibold py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
          >
            이름 추가
          </button>
        </form>

        {error && (
          <div className="mt-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 참가자 리스트 */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">참가자 목록</h2>
          <span className="text-sm text-[var(--foreground)]/60">{group.members.length}명</span>
        </div>
        
        <MemberList
          members={group.members}
          onUpdate={handleUpdateMember}
          onDelete={handleDeleteMember}
        />
      </div>

      {/* 매칭 시작 버튼 */}
      <button
        onClick={handleStartMatching}
        disabled={group.members.length < 2}
        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg"
      >
        🎲 매칭 시작
      </button>

      {group.members.length < 2 && (
        <p className="text-center text-sm text-[var(--foreground)]/50 mt-3">
          매칭을 시작하려면 최소 2명의 참가자가 필요합니다
        </p>
      )}
    </div>
  );
}

export default function GroupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>로딩 중...</p>
        </div>
      </div>
    }>
      <GroupPageContent />
    </Suspense>
  );
}

