'use client';

import { useMemo, useRef, useEffect } from 'react';
import type { MemberWithTasks, Task, TaskStatus } from '@/types';
import { STATUS_COLORS } from '@/types';

type ViewMode = 'week' | 'month';

interface GanttChartProps {
  members: MemberWithTasks[];
  viewMode: ViewMode;
  onAddTask: (memberId: string) => void;
  onEditTask: (memberId: string, task: Task & { id: string }) => void;
  onDeleteTask: (memberId: string, taskId: string) => void;
  onDeleteMember: (memberId: string) => void;
}

const DAY_WIDTH = 40;
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 60;
const MEMBER_COL_WIDTH = 180;

export default function GanttChart({
  members,
  viewMode,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteMember,
}: GanttChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  const { startDate, endDate, days, weeks, months } = useMemo(() => {
    const today = new Date();
    let start: Date;
    let end: Date;

    if (viewMode === 'week') {
      // Show 2 weeks before and 4 weeks after
      start = new Date(today);
      start.setDate(start.getDate() - 14);
      end = new Date(today);
      end.setDate(end.getDate() + 28);
    } else {
      // Show 1 month before and 2 months after
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    }

    // Adjust to start on Monday
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const days: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Group by weeks
    const weeks: { start: Date; days: Date[] }[] = [];
    let currentWeek: Date[] = [];
    days.forEach((day, index) => {
      currentWeek.push(day);
      if (day.getDay() === 0 || index === days.length - 1) {
        weeks.push({ start: currentWeek[0], days: [...currentWeek] });
        currentWeek = [];
      }
    });

    // Group by months
    const months: { year: number; month: number; days: Date[] }[] = [];
    days.forEach((day) => {
      const year = day.getFullYear();
      const month = day.getMonth();
      const existing = months.find((m) => m.year === year && m.month === month);
      if (existing) {
        existing.days.push(day);
      } else {
        months.push({ year, month, days: [day] });
      }
    });

    return { startDate: start, endDate: end, days, weeks, months };
  }, [viewMode]);

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const todayPosition = todayRef.current.offsetLeft;
      const containerWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollLeft = todayPosition - containerWidth / 2 + MEMBER_COL_WIDTH;
    }
  }, [days]);

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);

    const startIndex = days.findIndex(
      (d) => d.toISOString().split('T')[0] === taskStart.toISOString().split('T')[0]
    );
    const endIndex = days.findIndex(
      (d) => d.toISOString().split('T')[0] === taskEnd.toISOString().split('T')[0]
    );

    if (startIndex === -1 && endIndex === -1) return null;

    const actualStart = Math.max(0, startIndex === -1 ? 0 : startIndex);
    const actualEnd = Math.min(days.length - 1, endIndex === -1 ? days.length - 1 : endIndex);

    return {
      left: actualStart * DAY_WIDTH,
      width: (actualEnd - actualStart + 1) * DAY_WIDTH - 4,
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };

  const formatMonth = (month: number) => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return months[month];
  };

  const getDayLabel = (date: Date) => {
    const labels = ['일', '월', '화', '수', '목', '금', '토'];
    return labels[date.getDay()];
  };

  const chartWidth = days.length * DAY_WIDTH;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex">
        {/* Fixed Member Column */}
        <div className="flex-shrink-0 border-r border-gray-200" style={{ width: MEMBER_COL_WIDTH }}>
          {/* Header */}
          <div
            className="bg-gray-50 border-b border-gray-200 px-4 flex items-center font-medium text-gray-700"
            style={{ height: HEADER_HEIGHT }}
          >
            팀원
          </div>

          {/* Member Rows */}
          {members.map((member) => (
            <div
              key={member.id}
              className="border-b border-gray-100 px-4 flex items-center justify-between group hover:bg-gray-50"
              style={{ height: ROW_HEIGHT }}
            >
              <span className="font-medium text-gray-900 truncate">{member.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => onAddTask(member.id)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title="업무 추가"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteMember(member.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="팀원 삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Chart Area */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto">
          <div style={{ width: chartWidth, minWidth: '100%' }}>
            {/* Date Header */}
            <div className="bg-gray-50 border-b border-gray-200" style={{ height: HEADER_HEIGHT }}>
              {/* Month Row */}
              <div className="flex h-1/2 border-b border-gray-100">
                {months.map((month, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center text-sm font-medium text-gray-700 border-r border-gray-100"
                    style={{ width: month.days.length * DAY_WIDTH }}
                  >
                    {month.year}년 {formatMonth(month.month)}
                  </div>
                ))}
              </div>

              {/* Day Row */}
              <div className="flex h-1/2">
                {days.map((day, i) => (
                  <div
                    key={i}
                    ref={isToday(day) ? todayRef : null}
                    className={`flex flex-col items-center justify-center text-xs border-r border-gray-100 ${
                      isWeekend(day) ? 'bg-gray-100 text-gray-500' : 'text-gray-600'
                    } ${isToday(day) ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}
                    style={{ width: DAY_WIDTH }}
                  >
                    <span>{formatDate(day)}</span>
                    <span className="text-[10px]">{getDayLabel(day)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            {members.map((member) => (
              <div
                key={member.id}
                className="relative border-b border-gray-100"
                style={{ height: ROW_HEIGHT }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={`border-r border-gray-50 ${
                        isWeekend(day) ? 'bg-gray-50' : ''
                      } ${isToday(day) ? 'bg-blue-50' : ''}`}
                      style={{ width: DAY_WIDTH }}
                    />
                  ))}
                </div>

                {/* Today line */}
                {days.some(isToday) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                    style={{
                      left: days.findIndex(isToday) * DAY_WIDTH + DAY_WIDTH / 2,
                    }}
                  />
                )}

                {/* Tasks */}
                {member.taskList.map((task) => {
                  const position = getTaskPosition(task);
                  if (!position) return null;

                  return (
                    <div
                      key={task.id}
                      className="absolute top-2 h-8 rounded cursor-pointer transition-all hover:brightness-110 hover:shadow-md flex items-center px-2 text-white text-xs font-medium truncate group"
                      style={{
                        left: position.left + 2,
                        width: position.width,
                        backgroundColor: STATUS_COLORS[task.status],
                      }}
                      onClick={() => onEditTask(member.id, task)}
                      title={`${task.title} (${task.startDate} ~ ${task.endDate})`}
                    >
                      <span className="truncate">{task.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(member.id, task.id);
                        }}
                        className="absolute right-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white hover:bg-opacity-20 rounded"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
