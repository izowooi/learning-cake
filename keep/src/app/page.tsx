'use client';

import { useState, useEffect } from 'react';
import { Memo } from '@/types/memo';
import { subscribeMemos } from '@/lib/firebase';
import MemoCard from '@/components/MemoCard';
import MemoEditor from '@/components/MemoEditor';
import CreateMemoButton from '@/components/CreateMemoButton';

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeMemos((newMemos) => {
      setMemos(newMemos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const pinnedMemos = memos.filter((m) => m.pinned);
  const otherMemos = memos.filter((m) => !m.pinned);

  return (
    <main className="min-h-screen">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-medium text-gray-800">Keep</h1>
        </div>
      </header>

      {/* 메모 작성 버튼 */}
      <div className="max-w-xl mx-auto px-4 py-6">
        <CreateMemoButton onClick={() => setIsCreating(true)} />
      </div>

      {/* 메모 목록 */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center text-gray-500 py-12">로딩 중...</div>
        ) : memos.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            메모가 없습니다. 새 메모를 작성해보세요!
          </div>
        ) : (
          <>
            {/* 고정된 메모 */}
            {pinnedMemos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  고정됨
                </h2>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {pinnedMemos.map((memo) => (
                    <MemoCard
                      key={memo.id}
                      memo={memo}
                      onClick={() => setSelectedMemo(memo)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 기타 메모 */}
            {otherMemos.length > 0 && (
              <div>
                {pinnedMemos.length > 0 && (
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    기타
                  </h2>
                )}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {otherMemos.map((memo) => (
                    <MemoCard
                      key={memo.id}
                      memo={memo}
                      onClick={() => setSelectedMemo(memo)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 메모 에디터 모달 */}
      {(selectedMemo || isCreating) && (
        <MemoEditor
          memo={selectedMemo}
          isNew={isCreating}
          onClose={() => {
            setSelectedMemo(null);
            setIsCreating(false);
          }}
        />
      )}
    </main>
  );
}
