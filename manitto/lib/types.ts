// 마니또 앱의 타입 정의

// 미션 수행 기록
export interface MissionRecord {
  missionId: string;
  completedAt: string;
  note: string; // 텍스트 기록
}

// 미션 정의
export interface Mission {
  id: string;
  title: string;
  description: string;
  score: number; // 1-100
}

// 매칭
export interface Matching {
  from: string;
  to: string;
  matchingPassword: string; // 개별 매칭 비밀번호
  missionRecords: MissionRecord[]; // 수행자(from)의 미션 기록
}

// 그룹
export interface Group {
  id: string;
  groupName: string;
  leaderName: string;
  password: string;
  members: string[];
  matchings: Matching[] | null;
  createdAt: string;
  missionsEnabled: boolean; // 미션 활성화 여부
  missions: Mission[]; // 미션 목록
}

// 그룹 생성 입력
export interface GroupCreateInput {
  groupName: string;
  leaderName: string;
  missionsEnabled?: boolean;
  missions?: Omit<Mission, 'id'>[];
}

