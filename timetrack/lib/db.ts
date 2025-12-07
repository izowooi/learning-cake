import { database } from './firebase';
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database';
import type { Team, Member, Task } from '@/types';

const ROOT_KEY = 'ganttly';

// Team operations
export async function getTeam(teamName: string): Promise<Team | null> {
  const teamRef = ref(database, `${ROOT_KEY}/${teamName}`);
  const snapshot = await get(teamRef);
  return snapshot.exists() ? snapshot.val() : null;
}

export async function createTeam(teamName: string, password: string): Promise<void> {
  const teamRef = ref(database, `${ROOT_KEY}/${teamName}`);
  await set(teamRef, {
    password,
    createdAt: Date.now(),
    members: {},
  });
}

export async function teamExists(teamName: string): Promise<boolean> {
  const team = await getTeam(teamName);
  return team !== null;
}

// Member operations
export async function addMember(teamName: string, name: string): Promise<string> {
  const membersRef = ref(database, `${ROOT_KEY}/${teamName}/members`);
  const snapshot = await get(membersRef);
  const members = snapshot.val() || {};
  const order = Object.keys(members).length;

  const newMemberRef = push(membersRef);
  await set(newMemberRef, {
    name,
    order,
    tasks: {},
  });

  return newMemberRef.key!;
}

export async function updateMember(
  teamName: string,
  memberId: string,
  data: Partial<Member>
): Promise<void> {
  const memberRef = ref(database, `${ROOT_KEY}/${teamName}/members/${memberId}`);
  await update(memberRef, data);
}

export async function deleteMember(teamName: string, memberId: string): Promise<void> {
  const memberRef = ref(database, `${ROOT_KEY}/${teamName}/members/${memberId}`);
  await remove(memberRef);
}

// Task operations
export async function addTask(
  teamName: string,
  memberId: string,
  task: Omit<Task, 'id'>
): Promise<string> {
  const tasksRef = ref(database, `${ROOT_KEY}/${teamName}/members/${memberId}/tasks`);
  const newTaskRef = push(tasksRef);
  await set(newTaskRef, task);
  return newTaskRef.key!;
}

export async function updateTask(
  teamName: string,
  memberId: string,
  taskId: string,
  data: Partial<Task>
): Promise<void> {
  const taskRef = ref(database, `${ROOT_KEY}/${teamName}/members/${memberId}/tasks/${taskId}`);
  await update(taskRef, data);
}

export async function deleteTask(
  teamName: string,
  memberId: string,
  taskId: string
): Promise<void> {
  const taskRef = ref(database, `${ROOT_KEY}/${teamName}/members/${memberId}/tasks/${taskId}`);
  await remove(taskRef);
}

// Real-time subscription
export function subscribeToTeam(
  teamName: string,
  callback: (team: Team | null) => void
): () => void {
  const teamRef = ref(database, `${ROOT_KEY}/${teamName}`);

  const handler = (snapshot: DataSnapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  };

  onValue(teamRef, handler);

  return () => off(teamRef, 'value', handler);
}
