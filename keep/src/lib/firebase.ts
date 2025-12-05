import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, remove, onValue, off } from 'firebase/database';
import { Memo, MemoInput } from '@/types/memo';

const firebaseConfig = {
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

if (!firebaseConfig.databaseURL) {
  throw new Error('NEXT_PUBLIC_FIREBASE_DATABASE_URL is not defined');
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const MEMOS_PATH = 'memos';
const TITLE_MAX_LENGTH = 100;
const CONTENT_MAX_LENGTH = 5000;

// 글자 수 제한 유틸
export function truncateTitle(title: string): string {
  return title.slice(0, TITLE_MAX_LENGTH);
}

export function truncateContent(content: string): string {
  return content.slice(0, CONTENT_MAX_LENGTH);
}

// 메모 목록 구독
export function subscribeMemos(callback: (memos: Memo[]) => void): () => void {
  const memosRef = ref(database, MEMOS_PATH);

  const handleValue = (snapshot: any) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const memos: Memo[] = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      title: value.title || '',
      content: value.content || '',
      pinned: value.pinned || false,
      createdAt: value.createdAt || Date.now(),
      updatedAt: value.updatedAt || Date.now(),
    }));

    // 정렬: pinned 우선, 그 다음 updatedAt 최신순
    memos.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return b.updatedAt - a.updatedAt;
    });

    callback(memos);
  };

  onValue(memosRef, handleValue);

  return () => off(memosRef, 'value', handleValue);
}

// 메모 생성
export async function createMemo(input: MemoInput): Promise<string> {
  const memosRef = ref(database, MEMOS_PATH);
  const newMemoRef = push(memosRef);
  const now = Date.now();

  await set(newMemoRef, {
    title: truncateTitle(input.title),
    content: truncateContent(input.content),
    pinned: input.pinned,
    createdAt: now,
    updatedAt: now,
  });

  return newMemoRef.key!;
}

// 메모 수정
export async function updateMemo(id: string, updates: Partial<MemoInput>): Promise<void> {
  const memoRef = ref(database, `${MEMOS_PATH}/${id}`);

  const updateData: any = {
    updatedAt: Date.now(),
  };

  if (updates.title !== undefined) {
    updateData.title = truncateTitle(updates.title);
  }
  if (updates.content !== undefined) {
    updateData.content = truncateContent(updates.content);
  }
  if (updates.pinned !== undefined) {
    updateData.pinned = updates.pinned;
  }

  await set(memoRef, updateData);
}

// 메모 삭제
export async function deleteMemo(id: string): Promise<void> {
  const memoRef = ref(database, `${MEMOS_PATH}/${id}`);
  await remove(memoRef);
}
