'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { AlertTriangle, Search, User, Building2 } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
import type { User as UserType } from '@/lib/types';

export default function SelectUserPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        params.set('limit', '50');

        const response = await fetch(`/api/users?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  const handleSelectUser = (user: UserType) => {
    setUser(user);
    router.push('/incidents');
  };

  // Group users by role
  const groupedUsers = users.reduce((acc, user) => {
    const role = user.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {} as Record<string, UserType[]>);

  const roleOrder = ['admin', 'hod', 'risk_office', 'employee'];

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <AlertTriangle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Conduct & Behaviour Log</h1>
          </div>
          <p className="text-muted-foreground">
            Select a user to continue. This is a demo environment without authentication.
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
            <CardDescription>
              Choose from the available users below or search by name/email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No users found
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {roleOrder.map((role) => {
                    const roleUsers = groupedUsers[role];
                    if (!roleUsers?.length) return null;

                    const roleConfig = USER_ROLES[role as keyof typeof USER_ROLES];

                    return (
                      <div key={role}>
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline">{roleConfig.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {roleConfig.description}
                          </span>
                        </div>
                        <div className="grid gap-2">
                          {roleUsers.map((user) => (
                            <UserCard
                              key={user.id}
                              user={user}
                              onSelect={() => handleSelectUser(user)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This MVP environment uses a user selector instead of
              authentication. In production, users would be authenticated via SSO/SAML
              and their roles determined by Active Directory groups.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserCard({ user, onSelect }: { user: UserType; onSelect: () => void }) {
  const roleConfig = USER_ROLES[user.role];

  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-start p-3 text-left"
      onClick={onSelect}
    >
      <div className="flex w-full items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="font-medium">{user.displayName}</span>
            <Badge
              variant="secondary"
              className={
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : user.role === 'hod'
                  ? 'bg-blue-100 text-blue-700'
                  : user.role === 'risk_office'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
              }
            >
              {roleConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="truncate">{user.email}</span>
            {user.departmentName && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {user.departmentName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Button>
  );
}
