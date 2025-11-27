'use client';

import { useUser } from '@/hooks/use-user';
import { UserNav } from './user-nav';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <Button asChild size="sm">
            <Link href="/incidents/new">
              <Plus className="mr-2 h-4 w-4" />
              New Incident
            </Link>
          </Button>
        )}
        <UserNav />
      </div>
    </header>
  );
}
