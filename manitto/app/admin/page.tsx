'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllGroups, findGroupByPassword, deleteGroup } from '@/lib/firebase-storage';
import { Group } from '@/lib/types';
import MatchingResult from '@/components/MatchingResult';

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [password, setPassword] = useState('');
  const [searchedGroup, setSearchedGroup] = useState<Group | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const loadedGroups = await getAllGroups();
        setGroups(loadedGroups);
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchedGroup(null);

    if (!password.trim()) {
      setSearchError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const group = await findGroupByPassword(password.trim());
      if (group) {
        setSearchedGroup(group);
      } else {
        setSearchError('해당 비밀번호의 그룹을 찾을 수 없습니다.');
      }
    } catch (err) {
      setSearchError('검색 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteGroup = async (id: string, groupName: string) => {
    if (confirm(`"${groupName}" 그룹을 삭제하시겠습니까?`)) {
      try {
        const success = await deleteGroup(id);
        if (success) {
          setGroups(groups.filter(g => g.id !== id));
          if (searchedGroup?.id === id) {
            setSearchedGroup(null);
          }
        }
      } catch (err) {
        console.error('Failed to delete group:', err);
      }
    }
  };

  const clearSearch = () => {
    setSearchedGroup(null);
    setPassword('');
    setSearchError('');
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

  return (
    <div className="animate-fadeIn">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block text-[var(--foreground)]/60 hover:text-[var(--primary)] mb-4 transition-colors">
          ← 메인으로
        </Link>
        <div className="text-4xl mb-3">⚙️</div>
        <h1 className="text-2xl font-bold text-[var(--primary)]">관리자 페이지</h1>
        <p className="text-[var(--foreground)]/70">그룹 관리 및 결과 조회</p>
      </div>

      {/* 비밀번호로 검색 */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">🔍 비밀번호로 결과 조회</h2>
        
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="그룹 비밀번호 입력"
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
          />
          <button
            type="submit"
            className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
          >
            조회
          </button>
        </form>

        {searchError && (
          <div className="mt-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-xl text-sm">
            ⚠️ {searchError}
          </div>
        )}
      </div>

      {/* 검색 결과 */}
      {searchedGroup && (
        <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">검색 결과</h2>
            <button
              onClick={clearSearch}
              className="text-sm text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors"
            >
              닫기 ✕
            </button>
          </div>

          {searchedGroup.matchings && searchedGroup.matchings.length > 0 ? (
            <MatchingResult
              matchings={searchedGroup.matchings}
              leaderName={searchedGroup.leaderName}
              groupName={searchedGroup.groupName}
            />
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🤔</div>
              <p className="text-[var(--foreground)]/60">아직 매칭이 완료되지 않은 그룹입니다.</p>
              <Link
                href={`/group?id=${searchedGroup.id}`}
                className="inline-block mt-4 text-[var(--primary)] hover:underline"
              >
                그룹 관리 페이지로 이동 →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 전체 그룹 목록 */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 border border-[var(--border)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">📋 전체 그룹 목록</h2>
          <span className="text-sm text-[var(--foreground)]/60">{groups.length}개 그룹</span>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-8 text-[var(--foreground)]/50">
            <div className="text-4xl mb-2">📭</div>
            <p>생성된 그룹이 없습니다.</p>
            <Link
              href="/"
              className="inline-block mt-4 text-[var(--primary)] hover:underline"
            >
              새 그룹 만들러 가기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {groups.map((group, index) => (
              <div
                key={group.id}
                className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)] animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--foreground)]">{group.groupName}</h3>
                    <p className="text-sm text-[var(--foreground)]/60">리더: {group.leaderName}</p>
                    <p className="text-xs text-[var(--foreground)]/40 mt-1">
                      참가자: {group.members.length}명 | 
                      {group.matchings ? ' ✅ 매칭 완료' : ' ⏳ 매칭 대기'}
                    </p>
                    <p className="text-xs text-[var(--secondary)] mt-1">
                      비밀번호: {group.password}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={group.matchings ? `/result?id=${group.id}` : `/group?id=${group.id}`}
                      className="p-2 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--primary)] transition-colors"
                      title="보기"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.groupName)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                      title="삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

