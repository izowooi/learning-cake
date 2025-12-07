import {
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// 인증 상태 구독
export function subscribeToAuthState(
  callback: (state: AuthState) => void
): () => void {
  // 초기 로딩 상태 전달
  callback({ user: null, loading: true });

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    callback({ user, loading: false });
  });

  return unsubscribe;
}

// 현재 인증된 사용자 가져오기
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// 인증 여부 확인
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

// 익명 로그인
export async function login(): Promise<void> {
  await signInAnonymously(auth);
}

// 로그아웃
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}
