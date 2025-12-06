// 순환 매칭 알고리즘
import { Matching } from './types';
import { generatePassword } from './password';

// Fisher-Yates 셔플 알고리즘
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 순환 매칭 생성: A → B → C → A
export function createCircularMatching(members: string[]): Matching[] {
  if (members.length < 2) {
    throw new Error('매칭을 위해서는 최소 2명이 필요합니다.');
  }

  // 멤버 목록을 셔플
  const shuffled = shuffle(members);

  // 순환 매칭 생성 (각 사람이 다음 사람을 가리킴)
  const matchings: Matching[] = [];
  for (let i = 0; i < shuffled.length; i++) {
    const from = shuffled[i];
    const to = shuffled[(i + 1) % shuffled.length]; // 마지막 사람은 첫 번째 사람을 가리킴
    matchings.push({
      from,
      to,
      matchingPassword: generatePassword(),
      missionRecords: []
    });
  }

  return matchings;
}

