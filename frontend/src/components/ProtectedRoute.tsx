'use client';

import { useAuth } from '@/context/AuthContext';
import { CenteredAppLoader } from '@/components/loading/LoadingUI';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <CenteredAppLoader title="Loading your dashboard" subtitle="Checking your session and unlocking your member area." />;
  }

  if (!user) return null;

  return <>{children}</>;
}
