import { ref, get, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { getFirebaseDatabase } from './firebase';
import { Group, GroupCreateInput, Matching, MissionRecord } from './types';
import { generatePassword } from './password';

const GROUPS_PATH = 'manitto/groups';

// 클라이언트 사이드 체크
function isClient(): boolean {
  return typeof window !== 'undefined';
}

// 모든 그룹 가져오기
export async function getAllGroups(): Promise<Group[]> {
  if (!isClient()) return [];

  const db = getFirebaseDatabase();
  const groupsRef = ref(db, GROUPS_PATH);

  try {
    const snapshot = await get(groupsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.values(data) as Group[];
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    return [];
  }
}

// ID로 그룹 찾기
export async function getGroupById(id: string): Promise<Group | null> {
  if (!isClient()) return null;

  const db = getFirebaseDatabase();
  const groupRef = ref(db, `${GROUPS_PATH}/${id}`);

  try {
    const snapshot = await get(groupRef);
    if (!snapshot.exists()) return null;
    return snapshot.val() as Group;
  } catch (error) {
    console.error('Failed to fetch group:', error);
    return null;
  }
}

// 그룹명+리더명으로 그룹 찾기
export async function findGroupByNameAndLeader(
  groupName: string,
  leaderName: string
): Promise<Group | null> {
  const groups = await getAllGroups();
  return groups.find(
    g => g.groupName === groupName && g.leaderName === leaderName
  ) || null;
}

// 비밀번호로 그룹 찾기
export async function findGroupByPassword(password: string): Promise<Group | null> {
  if (!isClient()) return null;

  const db = getFirebaseDatabase();
  const groupsRef = ref(db, GROUPS_PATH);
  const passwordQuery = query(groupsRef, orderByChild('password'), equalTo(password));

  try {
    const snapshot = await get(passwordQuery);
    if (!snapshot.exists()) return null;

    const data = snapshot.val();
    const groups = Object.values(data) as Group[];
    return groups[0] || null;
  } catch (error) {
    console.error('Failed to find group by password:', error);
    return null;
  }
}

// 그룹 생성
export async function createGroup(input: GroupCreateInput): Promise<Group> {
  if (!isClient()) {
    throw new Error('createGroup can only be called on client side');
  }

  const db = getFirebaseDatabase();
  const id = crypto.randomUUID();

  // 미션에 ID 부여
  const missions = (input.missions || []).map((m) => ({
    ...m,
    id: crypto.randomUUID(),
  }));

  const newGroup: Group = {
    id,
    groupName: input.groupName,
    leaderName: input.leaderName,
    password: generatePassword(),
    members: [],
    matchings: null,
    createdAt: new Date().toISOString(),
    missionsEnabled: input.missionsEnabled || false,
    missions,
  };

  const groupRef = ref(db, `${GROUPS_PATH}/${id}`);
  await set(groupRef, newGroup);

  return newGroup;
}

// 그룹 업데이트
export async function updateGroup(
  id: string,
  updates: Partial<Group>
): Promise<Group | null> {
  if (!isClient()) return null;

  const db = getFirebaseDatabase();
  const groupRef = ref(db, `${GROUPS_PATH}/${id}`);

  try {
    const snapshot = await get(groupRef);
    if (!snapshot.exists()) return null;

    const currentGroup = snapshot.val() as Group;
    const updatedGroup = { ...currentGroup, ...updates };

    await set(groupRef, updatedGroup);
    return updatedGroup;
  } catch (error) {
    console.error('Failed to update group:', error);
    return null;
  }
}

// 멤버 추가
export async function addMember(
  groupId: string,
  memberName: string
): Promise<Group | null> {
  const group = await getGroupById(groupId);
  if (!group) return null;

  const updatedMembers = [...(group.members || []), memberName];
  return updateGroup(groupId, { members: updatedMembers });
}

// 멤버 수정
export async function updateMember(
  groupId: string,
  oldName: string,
  newName: string
): Promise<Group | null> {
  const group = await getGroupById(groupId);
  if (!group) return null;

  const updatedMembers = (group.members || []).map(m => m === oldName ? newName : m);
  return updateGroup(groupId, { members: updatedMembers });
}

// 멤버 삭제
export async function removeMember(
  groupId: string,
  memberName: string
): Promise<Group | null> {
  const group = await getGroupById(groupId);
  if (!group) return null;

  const updatedMembers = (group.members || []).filter(m => m !== memberName);
  return updateGroup(groupId, { members: updatedMembers });
}

// 매칭 결과 저장
export async function saveMatchings(
  groupId: string,
  matchings: Matching[]
): Promise<Group | null> {
  return updateGroup(groupId, { matchings });
}

// 그룹 삭제
export async function deleteGroup(id: string): Promise<boolean> {
  if (!isClient()) return false;

  const db = getFirebaseDatabase();
  const groupRef = ref(db, `${GROUPS_PATH}/${id}`);

  try {
    await remove(groupRef);
    return true;
  } catch (error) {
    console.error('Failed to delete group:', error);
    return false;
  }
}

// 매칭 비밀번호로 그룹과 매칭 찾기
export async function findMatchingByPassword(
  matchingPassword: string
): Promise<{ group: Group; matching: Matching } | null> {
  if (!isClient()) return null;

  try {
    const groups = await getAllGroups();

    for (const group of groups) {
      if (!group.matchings) continue;

      const matching = group.matchings.find(
        (m) => m.matchingPassword === matchingPassword
      );

      if (matching) {
        return { group, matching };
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to find matching by password:', error);
    return null;
  }
}

// 미션 기록 추가
export async function addMissionRecord(
  groupId: string,
  matchingPassword: string,
  missionId: string,
  note: string
): Promise<Group | null> {
  if (!isClient()) return null;

  try {
    const group = await getGroupById(groupId);
    if (!group || !group.matchings) return null;

    const matchingIndex = group.matchings.findIndex(
      (m) => m.matchingPassword === matchingPassword
    );

    if (matchingIndex === -1) return null;

    const newRecord: MissionRecord = {
      missionId,
      completedAt: new Date().toISOString(),
      note,
    };

    // 매칭의 미션 기록에 추가
    const updatedMatchings = [...group.matchings];
    updatedMatchings[matchingIndex] = {
      ...updatedMatchings[matchingIndex],
      missionRecords: [
        ...(updatedMatchings[matchingIndex].missionRecords || []),
        newRecord,
      ],
    };

    return updateGroup(groupId, { matchings: updatedMatchings });
  } catch (error) {
    console.error('Failed to add mission record:', error);
    return null;
  }
}
