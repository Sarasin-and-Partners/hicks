'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IncidentList } from '@/components/incidents/incident-list';
import { IncidentFiltersComponent, type IncidentFilters } from '@/components/incidents/incident-filters';
import { useIncidents } from '@/hooks/use-incidents';
import type { IncidentStatus, IncidentCategory, Severity } from '@/lib/types';

export default function IncidentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<IncidentFilters>({
    status: searchParams.get('status') as IncidentStatus | undefined,
    category: searchParams.get('category') as IncidentCategory | undefined,
    severity: searchParams.get('severity') as Severity | undefined,
    departmentId: searchParams.get('departmentId') || undefined,
    search: searchParams.get('search') || undefined,
    fromDate: searchParams.get('fromDate') || undefined,
    toDate: searchParams.get('toDate') || undefined,
  });

  const [page, setPage] = useState(1);

  const { incidents, pagination, isLoading, error } = useIncidents({
    page,
    pageSize: 20,
    ...filters,
    sortBy: 'reportedAt',
    sortOrder: 'desc',
  });

  const handleFiltersChange = useCallback((newFilters: IncidentFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change

    // Update URL with new filter params
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.severity) params.set('severity', newFilters.severity);
    if (newFilters.departmentId) params.set('departmentId', newFilters.departmentId);
    if (newFilters.fromDate) params.set('fromDate', newFilters.fromDate);
    if (newFilters.toDate) params.set('toDate', newFilters.toDate);

    const queryString = params.toString();
    router.push(queryString ? `/incidents?${queryString}` : '/incidents');
  }, [router]);

  const handleCreateNew = () => {
    router.push('/incidents/new');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Incidents</h1>
        <p className="text-muted-foreground">
          View and manage all conduct and behaviour incidents
        </p>
      </div>

      <IncidentFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <IncidentList
        incidents={incidents}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
