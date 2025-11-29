// 형용사+명사 비밀번호 생성기
import words from '@/data/words.json';

export function generatePassword(): string {
  const { adjectives, nouns } = words;
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}${randomNoun}`;
}

