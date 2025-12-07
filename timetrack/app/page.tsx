'use client';

import { useState, useEffect } from 'react';
import { getTeam, createTeam, teamExists, subscribeToTeam, addMember, deleteMember, addTask, updateTask, deleteTask } from '@/lib/db';
import { signInAnonymous, onAuthChange, getCurrentUser } from '@/lib/auth';
import type { Team, Task, MemberWithTasks, TaskStatus } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/types';
import GanttChart from '@/components/GanttChart';
import MemberModal from '@/components/MemberModal';
import TaskModal from '@/components/TaskModal';

const LAST_TEAM_KEY = 'ganttly_last_team';

type ViewMode = 'week' | 'month';
type AppState = 'loading' | 'entrance' | 'login' | 'team';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Team page states
  const [currentTeamName, setCurrentTeamName] = useState('');
  const [team, setTeam] = useState<Team | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<(Task & { id: string }) | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const lastTeam = localStorage.getItem(LAST_TEAM_KEY);

      // Check if user is already authenticated
      const currentUser = getCurrentUser();

      if (currentUser) {
        // Already authenticated
        if (lastTeam) {
          try {
            const { teamName: savedTeam, password: savedPassword } = JSON.parse(lastTeam);
            handleLogin(savedTeam, savedPassword, true);
          } catch {
            localStorage.removeItem(LAST_TEAM_KEY);
            setAppState('login');
          }
        } else {
          setAppState('login');
        }
      } else if (lastTeam) {
        // Has saved team but not authenticated - try to sign in
        try {
          await signInAnonymous();
          const { teamName: savedTeam, password: savedPassword } = JSON.parse(lastTeam);
          handleLogin(savedTeam, savedPassword, true);
        } catch {
          localStorage.removeItem(LAST_TEAM_KEY);
          setAppState('entrance');
        }
      } else {
        // No saved team - show entrance screen
        setAppState('entrance');
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (appState !== 'team' || !currentTeamName) return;

    const unsubscribe = subscribeToTeam(currentTeamName, (data) => {
      setTeam(data);
    });

    return () => unsubscribe();
  }, [appState, currentTeamName]);

  const handleLogin = async (name: string, pwd: string, isAutoLogin = false) => {
    setError('');
    setLoading(true);

    try {
      const teamData = await getTeam(name);

      if (!teamData) {
        if (isAutoLogin) {
          localStorage.removeItem(LAST_TEAM_KEY);
          setAppState('login');
          setLoading(false);
          return;
        }
        setError('존재하지 않는 팀입니다.');
        setLoading(false);
        return;
      }

      if (teamData.password !== pwd) {
        if (isAutoLogin) {
          localStorage.removeItem(LAST_TEAM_KEY);
          setAppState('login');
          setLoading(false);
          return;
        }
        setError('비밀번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      localStorage.setItem(LAST_TEAM_KEY, JSON.stringify({ teamName: name, password: pwd }));
      setCurrentTeamName(name);
      setTeam(teamData);
      setAppState('team');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
      if (isAutoLogin) {
        setAppState('login');
      }
    }
  };

  const handleCreate = async () => {
    setError('');
    setLoading(true);

    if (!teamName.trim()) {
      setError('팀 이름을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const exists = await teamExists(teamName);
      if (exists) {
        setError('이미 존재하는 팀 이름입니다.');
        setLoading(false);
        return;
      }

      await createTeam(teamName, password);
      localStorage.setItem(LAST_TEAM_KEY, JSON.stringify({ teamName, password }));
      setCurrentTeamName(teamName);
      setTeam({ password, createdAt: Date.now(), members: {} });
      setAppState('team');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('팀 생성 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      handleCreate();
    } else {
      handleLogin(teamName, password);
    }
  };

  const handleEntrance = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAnonymous();
      setAppState('login');
    } catch (err) {
      console.error(err);
      setError('입장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(LAST_TEAM_KEY);
    setTeam(null);
    setCurrentTeamName('');
    setTeamName('');
    setPassword('');
    setAppState('login');
  };

  const handleAddMember = async (name: string) => {
    await addMember(currentTeamName, name);
    setShowMemberModal(false);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (confirm('정말로 이 팀원을 삭제하시겠습니까? 관련된 모든 업무도 삭제됩니다.')) {
      await deleteMember(currentTeamName, memberId);
    }
  };

  const handleOpenTaskModal = (memberId: string, task?: Task & { id: string }) => {
    setSelectedMemberId(memberId);
    setEditingTask(task || null);
    setShowTaskModal(true);
  };

  // 연차 일수 계산 (시작일과 종료일 포함)
  const calculateVacationDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // 날짜에 일수 추가
  const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // 업무 딜레이 처리
  const delayTasksForVacation = async (
    memberId: string,
    vacationStartDate: string,
    vacationEndDate: string,
    excludeTaskId?: string
  ) => {
    const member = getMembersWithTasks().find((m) => m.id === memberId);
    if (!member) return;

    const vacationDays = calculateVacationDays(vacationStartDate, vacationEndDate);
    const vacStart = new Date(vacationStartDate);

    // 딜레이가 필요한 업무들 찾기 (연차와 겹치거나 연차 이후의 업무)
    const tasksToDelay = member.taskList.filter((task) => {
      if (task.id === excludeTaskId) return false;
      if (task.status === 'vacation') return false;

      const taskEnd = new Date(task.endDate);

      // 업무 종료일이 연차 시작일 이후인 경우 (겹치거나 이후)
      return taskEnd >= vacStart;
    });

    // 각 업무를 딜레이
    for (const task of tasksToDelay) {
      const taskStart = new Date(task.startDate);
      const vacStartDate = new Date(vacationStartDate);

      // 시작일은 유지하고 종료일만 연차 일수만큼 뒤로 밀기
      const newEndDate = addDays(task.endDate, vacationDays);

      await updateTask(currentTeamName, memberId, task.id, {
        endDate: newEndDate,
      });
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id'>, delayOtherTasks?: boolean) => {
    if (!selectedMemberId) return;

    // 연차 추가 시 다른 업무 딜레이 처리
    if (taskData.status === 'vacation' && delayOtherTasks && !editingTask) {
      await delayTasksForVacation(
        selectedMemberId,
        taskData.startDate,
        taskData.endDate
      );
    }

    if (editingTask) {
      // 기존 업무를 연차로 변경하는 경우
      if (taskData.status === 'vacation' && editingTask.status !== 'vacation' && delayOtherTasks) {
        await delayTasksForVacation(
          selectedMemberId,
          taskData.startDate,
          taskData.endDate,
          editingTask.id
        );
      }
      await updateTask(currentTeamName, selectedMemberId, editingTask.id, taskData);
    } else {
      await addTask(currentTeamName, selectedMemberId, taskData);
    }
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (memberId: string, taskId: string) => {
    if (confirm('정말로 이 업무를 삭제하시겠습니까?')) {
      await deleteTask(currentTeamName, memberId, taskId);
    }
  };

  const getMembersWithTasks = (): MemberWithTasks[] => {
    if (!team?.members) return [];

    return Object.entries(team.members)
      .map(([id, member]) => ({
        ...member,
        id,
        taskList: member.tasks
          ? Object.entries(member.tasks).map(([taskId, task]) => ({
              ...task,
              id: taskId,
            }))
          : [],
      }))
      .sort((a, b) => a.order - b.order);
  };

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Entrance page
  if (appState === 'entrance') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Ganttly</h1>
            <p className="text-gray-600 text-lg">팀 일정을 한눈에 관리하세요</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleEntrance}
            disabled={loading}
            className="px-8 py-4 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? '입장 중...' : '입장하기'}
          </button>
        </div>
      </main>
    );
  }

  // Login page
  if (appState === 'login') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ganttly</h1>
            <p className="text-gray-600">팀 일정을 한눈에 관리하세요</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex mb-6">
              <button
                type="button"
                className={`flex-1 py-2 text-center font-medium rounded-l-lg transition ${
                  !isCreating
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setIsCreating(false)}
              >
                팀 접속
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-center font-medium rounded-r-lg transition ${
                  isCreating
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setIsCreating(true)}
              >
                새 팀 생성
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                  팀 이름
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="팀 이름을 입력하세요"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : isCreating ? '팀 생성하기' : '접속하기'}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Team page
  const members = getMembersWithTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">{currentTeamName}</h1>
              <span className="text-sm text-gray-500">{members.length}명</span>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    viewMode === 'week'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  주간
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    viewMode === 'month'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  월간
                </button>
              </div>

              <button
                onClick={() => setShowMemberModal(true)}
                className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
              >
                + 팀원 추가
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-2 text-gray-600 text-sm hover:text-gray-900 transition"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {members.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">아직 팀원이 없습니다.</p>
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              첫 팀원 추가하기
            </button>
          </div>
        ) : (
          <GanttChart
            members={members}
            viewMode={viewMode}
            onAddTask={(memberId) => handleOpenTaskModal(memberId)}
            onEditTask={(memberId, task) => handleOpenTaskModal(memberId, task)}
            onDeleteTask={handleDeleteTask}
            onDeleteMember={handleDeleteMember}
          />
        )}
      </main>

      {/* Status Legend */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
        <div className="flex flex-wrap gap-3 text-xs">
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="text-gray-600">{STATUS_LABELS[status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showMemberModal && (
        <MemberModal
          onClose={() => setShowMemberModal(false)}
          onSave={handleAddMember}
        />
      )}

      {showTaskModal && selectedMemberId && (
        <TaskModal
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          initialData={editingTask || undefined}
          existingTasks={members.find((m) => m.id === selectedMemberId)?.taskList || []}
        />
      )}
    </div>
  );
}
