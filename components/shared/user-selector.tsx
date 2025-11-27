'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, ChevronsUpDown, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { User } from '@/lib/types';

interface UserSelectorProps {
  value?: string;
  onValueChange: (userId: string, user?: User) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  excludeIds?: string[];
}

export function UserSelector({
  value,
  onValueChange,
  placeholder = 'Select user...',
  disabled = false,
  className,
  excludeIds,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [hasFetched, setHasFetched] = useState(false);

  // Memoize excludeIds to prevent unnecessary re-renders
  const excludeIdsKey = useMemo(() => (excludeIds || []).join(','), [excludeIds]);

  useEffect(() => {
    // Only fetch once on mount and when search changes
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        params.set('limit', '20');

        const response = await fetch(`/api/users?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const excludeSet = new Set(excludeIds || []);
          setUsers(data.filter((u: User) => !excludeSet.has(u.id)));
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    };

    // Debounce the search
    const debounceTimer = setTimeout(fetchUsers, search ? 300 : 0);
    return () => clearTimeout(debounceTimer);
  }, [search, excludeIdsKey]);

  const selectedUser = users.find(u => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          {selectedUser ? (
            <span className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {selectedUser.displayName}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search users..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading...</CommandEmpty>
            ) : users.length === 0 ? (
              <CommandEmpty>No users found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      onValueChange(user.id, user);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === user.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email} • {user.departmentName}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
