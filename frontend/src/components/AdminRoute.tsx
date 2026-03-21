'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-green-400 text-sm animate-pulse">Checking access...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return <>{children}</>;
}
