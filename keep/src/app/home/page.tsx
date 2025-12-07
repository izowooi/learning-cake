'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Memo } from '@/types/memo';
import { subscribeMemos } from '@/lib/firebase';
import { subscribeToAuthState, logout } from '@/lib/auth';
import MemoCard from '@/components/MemoCard';
import MemoEditor from '@/components/MemoEditor';
import CreateMemoButton from '@/components/CreateMemoButton';

export default function HomePage() {
  const router = useRouter();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((state) => {
      if (!state.loading) {
        if (!state.user) {
          router.replace('/login');
        } else {
          setAuthChecked(true);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    const unsubscribe = subscribeMemos((newMemos) => {
      setMemos(newMemos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authChecked]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const pinnedMemos = memos.filter((m) => m.pinned);
  const otherMemos = memos.filter((m) => !m.pinned);

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-medium text-gray-800">Keep</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6">
        <CreateMemoButton onClick={() => setIsCreating(true)} />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center text-gray-500 py-12">로딩 중...</div>
        ) : memos.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            메모가 없습니다. 새 메모를 작성해보세요!
          </div>
        ) : (
          <>
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
