'use client';

import { Memo } from '@/types/memo';

interface MemoCardProps {
  memo: Memo;
  onClick: () => void;
}

export default function MemoCard({ memo, onClick }: MemoCardProps) {
  const truncatedContent =
    memo.content.length > 200 ? memo.content.slice(0, 200) + '...' : memo.content;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow break-inside-avoid mb-4"
    >
      {memo.pinned && (
        <div className="flex justify-end mb-1">
          <svg
            className="w-4 h-4 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )}
      {memo.title && (
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{memo.title}</h3>
      )}
      {memo.content && (
        <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-6">
          {truncatedContent}
        </p>
      )}
    </div>
  );
}
