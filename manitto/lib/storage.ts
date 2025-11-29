// LocalStorage 유틸리티 - 추후 DB 연동을 위해 서비스 레이어 분리
import { Group, GroupCreateInput, Matching } from './types';
import { generatePassword } from './password';

const STORAGE_KEY = 'manitto_groups';

// 모든 그룹 가져오기
export function getAllGroups(): Group[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// ID로 그룹 찾기
export function getGroupById(id: string): Group | null {
  const groups = getAllGroups();
  return groups.find(g => g.id === id) || null;
}

// 그룹명+리더명으로 그룹 찾기
export function findGroupByNameAndLeader(groupName: string, leaderName: string): Group | null {
  const groups = getAllGroups();
  return groups.find(
    g => g.groupName === groupName && g.leaderName === leaderName
  ) || null;
}

// 비밀번호로 그룹 찾기
export function findGroupByPassword(password: string): Group | null {
  const groups = getAllGroups();
  return groups.find(g => g.password === password) || null;
}

// UUID 생성
function generateId(): string {
  return crypto.randomUUID();
}

// 그룹 생성
export function createGroup(input: GroupCreateInput): Group {
  const groups = getAllGroups();
  
  const newGroup: Group = {
    id: generateId(),
    groupName: input.groupName,
    leaderName: input.leaderName,
    password: generatePassword(),
    members: [],
    matchings: null,
    createdAt: new Date().toISOString(),
  };
  
  groups.push(newGroup);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  
  return newGroup;
}

// 그룹 업데이트
export function updateGroup(id: string, updates: Partial<Group>): Group | null {
  const groups = getAllGroups();
  const index = groups.findIndex(g => g.id === id);
  
  if (index === -1) return null;
  
  groups[index] = { ...groups[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  
  return groups[index];
}

// 멤버 추가
export function addMember(groupId: string, memberName: string): Group | null {
  const group = getGroupById(groupId);
  if (!group) return null;
  
  const updatedMembers = [...group.members, memberName];
  return updateGroup(groupId, { members: updatedMembers });
}

// 멤버 수정
export function updateMember(groupId: string, oldName: string, newName: string): Group | null {
  const group = getGroupById(groupId);
  if (!group) return null;
  
  const updatedMembers = group.members.map(m => m === oldName ? newName : m);
  return updateGroup(groupId, { members: updatedMembers });
}

// 멤버 삭제
export function removeMember(groupId: string, memberName: string): Group | null {
  const group = getGroupById(groupId);
  if (!group) return null;
  
  const updatedMembers = group.members.filter(m => m !== memberName);
  return updateGroup(groupId, { members: updatedMembers });
}

// 매칭 결과 저장
export function saveMatchings(groupId: string, matchings: Matching[]): Group | null {
  return updateGroup(groupId, { matchings });
}

// 그룹 삭제
export function deleteGroup(id: string): boolean {
  const groups = getAllGroups();
  const filtered = groups.filter(g => g.id !== id);
  
  if (filtered.length === groups.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

