'use client';

import { useRouter } from 'next/navigation';
import { User, LogOut, Settings } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { USER_ROLES } from '@/lib/constants';

export function UserNav() {
  const { user, clearUser } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push('/select-user')}>
        <User className="mr-2 h-4 w-4" />
        Select User
      </Button>
    );
  }

  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleConfig = USER_ROLES[user.role];

  const handleLogout = () => {
    clearUser();
    router.push('/select-user');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {roleConfig.label}
              </Badge>
              {user.departmentName && (
                <span className="text-xs text-muted-foreground">
                  {user.departmentName}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/select-user')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Switch User</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
