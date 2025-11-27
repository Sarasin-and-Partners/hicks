'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { LoadingPage } from '@/components/shared/loading-spinner';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/incidents');
      } else {
        router.replace('/select-user');
      }
    }
  }, [user, isLoading, router]);

  return <LoadingPage message="Redirecting..." />;
}
