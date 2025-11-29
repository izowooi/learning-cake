'use client';

import { useState } from 'react';

interface MemberListProps {
  members: string[];
  onUpdate: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

export default function MemberList({ members, onUpdate, onDelete }: MemberListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditValue(currentName);
  };

  const handleEditSave = (oldName: string) => {
    if (editValue.trim() && editValue.trim() !== oldName) {
      onUpdate(oldName, editValue.trim());
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, oldName: string) => {
    if (e.key === 'Enter') {
      handleEditSave(oldName);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--foreground)]/50">
        <div className="text-4xl mb-2">👥</div>
        <p>아직 추가된 참가자가 없습니다.</p>
        <p className="text-sm">위에서 이름을 추가해주세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
      {members.map((member, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-[var(--background)] rounded-xl px-4 py-3 border border-[var(--border)] animate-fadeIn"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {editingIndex === index ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, member)}
              onBlur={() => handleEditSave(member)}
              autoFocus
              className="flex-1 px-2 py-1 rounded-lg border border-[var(--primary)] bg-transparent focus:outline-none"
            />
          ) : (
            <span className="font-medium">{member}</span>
          )}

          <div className="flex gap-2 ml-2">
            {editingIndex === index ? (
              <>
                <button
                  onClick={() => handleEditSave(member)}
                  className="p-2 rounded-lg hover:bg-[var(--secondary)]/20 text-[var(--secondary)] transition-colors"
                  title="저장"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                  title="취소"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEditStart(index, member)}
                  className="p-2 rounded-lg hover:bg-[var(--accent)]/20 text-[var(--accent)] transition-colors"
                  title="수정"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(member)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                  title="삭제"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

