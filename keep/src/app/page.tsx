'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToAuthState } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((state) => {
      if (!state.loading) {
        if (state.user) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
        setChecking(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return null;
}
