'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

interface TaskModalProps {
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>, delayOtherTasks?: boolean) => void;
  initialData?: Task;
  existingTasks?: (Task & { id: string })[];
}

export default function TaskModal({ onClose, onSave, initialData, existingTasks = [] }: TaskModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(initialData?.title || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || today);
  const [endDate, setEndDate] = useState(initialData?.endDate || today);
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'pending');
  const [delayTasks, setDelayTasks] = useState(true);
  const [error, setError] = useState('');

  // 연차 선택 시에만 딜레이 옵션 표시
  const showDelayOption = status === 'vacation';

  // 연차와 겹치는 업무가 있는지 확인
  const hasOverlappingTasks = existingTasks.some((task) => {
    if (task.id === (initialData as Task & { id: string })?.id) return false;
    if (task.status === 'vacation') return false;

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const vacStart = new Date(startDate);
    const vacEnd = new Date(endDate);

    // 업무가 연차 기간과 겹치거나 연차 이후에 있는 경우
    return taskEnd >= vacStart;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('업무 제목을 입력해주세요.');
      return;
    }

    if (!startDate || !endDate) {
      setError('시작일과 종료일을 선택해주세요.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('종료일은 시작일 이후여야 합니다.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        startDate,
        endDate,
        status,
      },
      showDelayOption && delayTasks
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {initialData ? '업무 수정' : '업무 추가'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
              업무 제목
            </label>
            <input
              type="text"
              id="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="업무 제목을 입력하세요"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                시작일
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                종료일
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* 연차 선택 시 업무 딜레이 옵션 */}
          {showDelayOption && hasOverlappingTasks && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={delayTasks}
                  onChange={(e) => setDelayTasks(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-yellow-800">
                  연차 기간만큼 다른 업무 자동 딜레이
                </span>
              </label>
              <p className="text-xs text-yellow-600 mt-1 ml-6">
                연차와 겹치거나 이후에 있는 업무들이 연차 일수만큼 뒤로 밀립니다.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              {initialData ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
