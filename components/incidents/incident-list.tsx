'use client';

import { IncidentCard } from './incident-card';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import type { Incident } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface IncidentListProps {
  incidents: Incident[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null;
  onPageChange?: (page: number) => void;
  onCreateNew?: () => void;
}

export function IncidentList({
  incidents,
  isLoading = false,
  pagination,
  onPageChange,
  onCreateNew,
}: IncidentListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="No incidents found"
        description="No incidents match your current filters. Try adjusting your search criteria or create a new incident."
        action={onCreateNew ? { label: 'Create Incident', onClick: onCreateNew } : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
            {pagination.totalCount} incidents
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
