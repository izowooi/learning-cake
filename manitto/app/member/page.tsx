'use client';

import { useState } from 'react';
import Link from 'next/link';
import { findMatchingByPassword, addMissionRecord, getGroupById } from '@/lib/firebase-storage';
import { Group, Matching, Mission } from '@/lib/types';

export default function MemberPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 조회 결과
  const [group, setGroup] = useState<Group | null>(null);
  const [matching, setMatching] = useState<Matching | null>(null);

  // 미션 기록 입력
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [missionNote, setMissionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGroup(null);
    setMatching(null);

    if (!password.trim()) {
      setError('매칭 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await findMatchingByPassword(password.trim());
      if (result) {
        setGroup(result.group);
        setMatching(result.matching);
      } else {
        setError('해당 비밀번호의 매칭을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMissionRecord = async () => {
    if (!selectedMissionId) {
      setError('미션을 선택해주세요.');
      return;
    }
    if (!missionNote.trim()) {
      setError('미션 완료 기록을 입력해주세요.');
      return;
    }
    if (!group || !matching) return;

    setIsSubmitting(true);
    setError('');

    try {
      const updatedGroup = await addMissionRecord(
        group.id,
        matching.matchingPassword,
        selectedMissionId,
        missionNote.trim()
      );

      if (updatedGroup) {
        // 상태 갱신
        setGroup(updatedGroup);
        const updatedMatching = updatedGroup.matchings?.find(
          (m) => m.matchingPassword === matching.matchingPassword
        );
        if (updatedMatching) {
          setMatching(updatedMatching);
        }
        setSelectedMissionId('');
        setMissionNote('');
      } else {
        setError('미션 기록 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to add mission record:', err);
      setError('미션 기록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSearch = () => {
    setGroup(null);
    setMatching(null);
    setPassword('');
    setError('');
    setSelectedMissionId('');
    setMissionNote('');
  };

  // 미션 점수 계산
  const calculateTotalScore = () => {
    if (!group || !matching || !group.missions) return 0;
    return (matching.missionRecords || []).reduce((total, record) => {
      const mission = group.missions.find((m) => m.id === record.missionId);
      return total + (mission?.score || 0);
    }, 0);
  };

  // 완료한 미션 ID 목록
  const completedMissionIds = (matching?.missionRecords || []).map((r) => r.missionId);

  return (
    <div className="animate-fadeIn">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block text-[var(--foreground)]/60 hover:text-[var(--primary)] mb-4 transition-colors">
          ← 메인으로
        </Link>
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-2xl font-bold text-[var(--primary)]">내 매칭 확인</h1>
        <p className="text-[var(--foreground)]/70">매칭 비밀번호로 나의 마니또 대상을 확인하세요</p>
      </div>

      {/* 비밀번호 검색 */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">매칭 비밀번호 입력</h2>

        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="매칭 비밀번호 입력 (예: 화사한강아지)"
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50"
          >
            {isLoading ? '검색 중...' : '조회'}
          </button>
        </form>

        {error && (
          <div className="mt-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 매칭 결과 */}
      {group && matching && (
        <>
          {/* 내 매칭 정보 */}
          <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">나의 마니또 대상</h2>
              <button
                onClick={clearSearch}
                className="text-sm text-[var(--foreground)]/60 hover:text-[var(--primary)] transition-colors"
              >
                닫기 ✕
              </button>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-[var(--foreground)]/60 mb-2">
                그룹: <span className="font-semibold text-[var(--foreground)]">{group.groupName}</span>
              </p>
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <p className="text-xs text-[var(--foreground)]/60 mb-1">나</p>
                  <span className="font-bold text-xl text-[var(--secondary)]">
                    {matching.from}
                  </span>
                </div>
                <span className="text-3xl">➡️</span>
                <div className="text-center">
                  <p className="text-xs text-[var(--foreground)]/60 mb-1">마니또 대상</p>
                  <span className="font-bold text-xl text-[var(--accent)]">
                    {matching.to}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[var(--foreground)]/60">
                <span className="font-semibold text-[var(--accent)]">{matching.to}</span>님에게 비밀 친구가 되어주세요!
              </p>
            </div>
          </div>

          {/* 미션 섹션 */}
          {group.missionsEnabled && (group.missions || []).length > 0 && (
            <>
              {/* 미션 목록 */}
              <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
                <h2 className="text-lg font-semibold mb-4">미션 목록</h2>

                <div className="space-y-3">
                  {(group.missions || []).map((mission) => {
                    const isCompleted = completedMissionIds.includes(mission.id);
                    return (
                      <div
                        key={mission.id}
                        className={`rounded-xl p-4 border ${
                          isCompleted
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                            : 'bg-[var(--background)] border-[var(--border)]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {isCompleted && <span className="text-green-600">✅</span>}
                              <span className="font-medium">{mission.title}</span>
                              <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full">
                                {mission.score}점
                              </span>
                            </div>
                            <p className="text-sm text-[var(--foreground)]/60 mt-1">
                              {mission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 총점 */}
                <div className="mt-4 pt-4 border-t border-[var(--border)] text-right">
                  <span className="text-sm text-[var(--foreground)]/60">내 총점: </span>
                  <span className="text-xl font-bold text-[var(--primary)]">
                    {calculateTotalScore()}점
                  </span>
                </div>
              </div>

              {/* 미션 기록 입력 */}
              <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--border)]">
                <h2 className="text-lg font-semibold mb-4">미션 완료 기록</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">미션 선택</label>
                    <select
                      value={selectedMissionId}
                      onChange={(e) => setSelectedMissionId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="">미션을 선택하세요</option>
                      {(group.missions || [])
                        .filter((m) => !completedMissionIds.includes(m.id))
                        .map((mission) => (
                          <option key={mission.id} value={mission.id}>
                            {mission.title} ({mission.score}점)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">미션 완료 기록</label>
                    <textarea
                      value={missionNote}
                      onChange={(e) => setMissionNote(e.target.value)}
                      placeholder="미션을 어떻게 수행했는지 기록해주세요"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                    />
                  </div>

                  <button
                    onClick={handleAddMissionRecord}
                    disabled={isSubmitting || !selectedMissionId || !missionNote.trim()}
                    className="w-full bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '저장 중...' : '미션 완료 기록'}
                  </button>
                </div>
              </div>

              {/* 내 미션 기록 */}
              {(matching.missionRecords || []).length > 0 && (
                <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 border border-[var(--border)]">
                  <h2 className="text-lg font-semibold mb-4">내 미션 기록</h2>

                  <div className="space-y-3">
                    {(matching.missionRecords || []).map((record, index) => {
                      const mission = (group.missions || []).find((m) => m.id === record.missionId);
                      return (
                        <div
                          key={index}
                          className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-600">✅</span>
                            <span className="font-medium">{mission?.title || '알 수 없는 미션'}</span>
                            <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full">
                              +{mission?.score || 0}점
                            </span>
                          </div>
                          <p className="text-sm text-[var(--foreground)]/70 ml-6">
                            {record.note}
                          </p>
                          <p className="text-xs text-[var(--foreground)]/40 ml-6 mt-1">
                            {new Date(record.completedAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 안내 */}
      {!group && !matching && (
        <div className="text-center text-sm text-[var(--foreground)]/50 mt-8">
          <p>매칭 비밀번호는 그룹 리더에게 받을 수 있습니다.</p>
          <p className="mt-1">리더가 매칭 완료 후 비밀번호를 공유해 드립니다.</p>
        </div>
      )}
    </div>
  );
}
