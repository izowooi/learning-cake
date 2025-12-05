'use client';

import { useState, useEffect, useRef } from 'react';
import { Memo } from '@/types/memo';
import { createMemo, updateMemo, deleteMemo } from '@/lib/firebase';

interface MemoEditorProps {
  memo: Memo | null;
  isNew: boolean;
  onClose: () => void;
}

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;

export default function MemoEditor({ memo, isNew, onClose }: MemoEditorProps) {
  const [title, setTitle] = useState(memo?.title || '');
  const [content, setContent] = useState(memo?.content || '');
  const [pinned, setPinned] = useState(memo?.pinned || false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const memoIdRef = useRef<string | null>(memo?.id || null);

  // 자동 저장 (디바운스)
  useEffect(() => {
    if (isNew && !memoIdRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (memoIdRef.current) {
        setSaving(true);
        await updateMemo(memoIdRef.current, { title, content, pinned });
        setSaving(false);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, pinned, isNew]);

  const handleCreate = async () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }

    setSaving(true);
    const newId = await createMemo({ title, content, pinned });
    memoIdRef.current = newId;
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!memoIdRef.current) return;

    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteMemo(memoIdRef.current);
      onClose();
    }
  };

  const handleClose = () => {
    if (isNew) {
      handleCreate();
    } else {
      onClose();
    }
  };

  const togglePin = async () => {
    const newPinned = !pinned;
    setPinned(newPinned);

    if (memoIdRef.current) {
      await updateMemo(memoIdRef.current, { pinned: newPinned });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            className="flex-1 text-lg font-medium outline-none"
            maxLength={TITLE_MAX}
          />
          <button
            onClick={togglePin}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              pinned ? 'text-yellow-500' : 'text-gray-400'
            }`}
            title={pinned ? '고정 해제' : '상단에 고정'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              {pinned ? (
                <path
                  fill="currentColor"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              ) : (
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              )}
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            placeholder="메모 작성..."
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX))}
            className="w-full h-full min-h-[200px] outline-none resize-none text-gray-700"
            maxLength={CONTENT_MAX}
          />
        </div>

        {/* 글자 수 표시 */}
        <div className="px-4 pb-2 text-xs text-gray-400 text-right">
          {content.length}/{CONTENT_MAX}
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-sm text-gray-400">저장 중...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                삭제
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
