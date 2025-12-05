'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validateAccessKey, saveAccessKey, isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/home');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (validateAccessKey(accessKey)) {
      saveAccessKey(accessKey);
      router.replace('/home');
    } else {
      setError('보안키가 올바르지 않습니다.');
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

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label
              htmlFor="accessKey"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              보안키
            </label>
            <input
              id="accessKey"
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="보안키를 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !accessKey.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? '확인 중...' : '입장하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
