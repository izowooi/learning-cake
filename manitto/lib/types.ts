// 마니또 앱의 타입 정의

export interface Matching {
  from: string;
  to: string;
}

export interface Group {
  id: string;
  groupName: string;
  leaderName: string;
  password: string;
  members: string[];
  matchings: Matching[] | null;
  createdAt: string;
}

export interface GroupCreateInput {
  groupName: string;
  leaderName: string;
}

