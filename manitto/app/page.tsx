'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createGroup, findGroupByNameAndLeader } from '@/lib/firebase-storage';
import { Mission } from '@/lib/types';

interface MissionInput {
  title: string;
  description: string;
  score: number;
}

export default function HomePage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 미션 관련 상태
  const [missionsEnabled, setMissionsEnabled] = useState(false);
  const [missions, setMissions] = useState<MissionInput[]>([]);
  const [newMission, setNewMission] = useState<MissionInput>({
    title: '',
    description: '',
    score: 10,
  });

  const handleAddMission = () => {
    if (!newMission.title.trim() || !newMission.description.trim()) {
      setError('미션 제목과 내용을 입력해주세요.');
      return;
    }
    if (newMission.score < 1 || newMission.score > 100) {
      setError('점수는 1~100 사이여야 합니다.');
      return;
    }
    if (missions.length >= 5) {
      setError('미션은 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    setMissions([...missions, { ...newMission }]);
    setNewMission({ title: '', description: '', score: 10 });
    setError('');
  };

  const handleRemoveMission = (index: number) => {
    setMissions(missions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim() || !leaderName.trim()) {
      setError('그룹명과 리더 이름을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 중복 체크
      const existingGroup = await findGroupByNameAndLeader(groupName.trim(), leaderName.trim());
      if (existingGroup) {
        setError(`이미 "${groupName}" 그룹의 "${leaderName}" 리더가 존재합니다.`);
        setIsLoading(false);
        return;
      }

      // 그룹 생성
      const newGroup = await createGroup({
        groupName: groupName.trim(),
        leaderName: leaderName.trim(),
        missionsEnabled,
        missions: missionsEnabled ? missions : [],
      });

      // 이름 입력 페이지로 이동
      router.push(`/group?id=${newGroup.id}`);
    } catch (err) {
      console.error('그룹 생성 에러:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`그룹 생성 중 오류: ${errorMessage}`);
      setIsLoading(false);
    }
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

          {/* 미션 설정 토글 */}
          <div className="border-t border-[var(--border)] pt-5">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="missionsEnabled" className="text-sm font-medium">
                  미션 기능
                </label>
                <p className="text-xs text-[var(--foreground)]/60 mt-1">
                  마니또 활동 미션을 추가할 수 있습니다
                </p>
              </div>
              <button
                type="button"
                id="missionsEnabled"
                onClick={() => setMissionsEnabled(!missionsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  missionsEnabled ? 'bg-[var(--primary)]' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    missionsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 미션 추가 섹션 */}
          {missionsEnabled && (
            <div className="space-y-4 bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
              <h3 className="text-sm font-semibold">미션 추가 (최대 5개)</h3>

              {/* 기존 미션 목록 */}
              {missions.length > 0 && (
                <div className="space-y-2">
                  {missions.map((mission, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between bg-[var(--card-bg)] rounded-lg p-3 border border-[var(--border)]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{mission.title}</span>
                          <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full">
                            {mission.score}점
                          </span>
                        </div>
                        <p className="text-xs text-[var(--foreground)]/60 mt-1">
                          {mission.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMission(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 미션 입력 폼 */}
              {missions.length < 5 && (
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={newMission.title}
                      onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                      placeholder="미션 제목"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <textarea
                      value={newMission.description}
                      onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                      placeholder="미션 내용"
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[var(--foreground)]/70">점수:</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newMission.score}
                        onChange={(e) => setNewMission({ ...newMission, score: Number(e.target.value) })}
                        className="w-20 px-2 py-1 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMission}
                      className="flex-1 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all"
                    >
                      미션 추가
                    </button>
                  </div>
                </div>
              )}

              {missions.length === 5 && (
                <p className="text-xs text-[var(--foreground)]/60 text-center">
                  최대 5개의 미션을 추가했습니다
                </p>
              )}
            </div>
          )}

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

      {/* 구성원/관리자 페이지 링크 */}
      <div className="flex justify-center gap-6">
        <Link
          href="/member"
          className="inline-flex items-center gap-2 text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          내 매칭 확인
        </Link>
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

      {/* 푸터 */}
      <footer className="text-center mt-12 text-white/30 text-sm">
        <p>Copyright (C) 2025 jonghyun</p>
        <p>
          <a
            href="https://github.com/izowooi/learning-cake/tree/main/manitto"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors"
          >
            소스 코드 보기
          </a>
          {' / '}
          <a
            href="https://github.com/izowooi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors"
          >
            izowooi
          </a>
        </p>
      </footer>
    </div>
  );
}
