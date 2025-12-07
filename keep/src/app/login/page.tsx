'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, subscribeToAuthState } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((state) => {
      if (!state.loading && state.user) {
        router.replace('/home');
      } else if (!state.loading) {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleEnter = async () => {
    setError('');
    setLoading(true);

    try {
      await login();
      router.replace('/home');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
      setError(message);
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Keep</h1>
          <p className="text-gray-500">메모를 공유하세요</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? '입장 중...' : '입장하기'}
          </button>
        </div>
      </div>
    </main>
  );
}
