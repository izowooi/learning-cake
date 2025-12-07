export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'vacation';

export interface Task {
  id?: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: TaskStatus;
}

export interface Member {
  id?: string;
  name: string;
  order: number;
  tasks?: Record<string, Task>;
}

export interface Team {
  password: string;
  createdAt: number;
  members?: Record<string, Member>;
}

export interface MemberWithTasks extends Member {
  id: string;
  taskList: (Task & { id: string })[];
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#9CA3AF',
  in_progress: '#3B82F6',
  completed: '#22C55E',
  vacation: '#EAB308',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: '대기',
  in_progress: '진행중',
  completed: '완료',
  vacation: '휴가/연차',
};
