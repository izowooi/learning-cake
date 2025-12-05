export interface Memo {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type MemoInput = Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>;
