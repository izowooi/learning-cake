const AUTH_STORAGE_KEY = 'keep_access_key';

export function getExpectedAccessKey(): string {
  const key = process.env.NEXT_PUBLIC_ACCESS_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_ACCESS_KEY is not defined');
  }
  return key;
}

export function getSavedAccessKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function saveAccessKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, key);
}

export function clearAccessKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function validateAccessKey(inputKey: string): boolean {
  const expectedKey = getExpectedAccessKey();
  return inputKey === expectedKey;
}

export function isAuthenticated(): boolean {
  const savedKey = getSavedAccessKey();
  if (!savedKey) return false;
  return validateAccessKey(savedKey);
}
