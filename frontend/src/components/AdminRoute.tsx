'use client';

import { useAuth } from '@/context/AuthContext';
import { CenteredAppLoader } from '@/components/loading/LoadingUI';
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
    return <CenteredAppLoader title="Verifying admin access" subtitle="Checking your permissions and preparing the control panel." />;
  }

  if (!user || user.role !== 'admin') return null;

  return <>{children}</>;
}
