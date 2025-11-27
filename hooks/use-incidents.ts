'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Incident, PaginatedResponse, IncidentStatus, IncidentCategory, Severity } from '@/lib/types';

interface UseIncidentsOptions {
  page?: number;
  pageSize?: number;
  status?: IncidentStatus;
  category?: IncidentCategory;
  severity?: Severity;
  departmentId?: string;
  teamId?: string;
  reporterId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UseIncidentsReturn {
  incidents: Incident[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIncidents(options: UseIncidentsOptions = {}): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState<UseIncidentsReturn['pagination']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (options.page) params.set('page', options.page.toString());
      if (options.pageSize) params.set('pageSize', options.pageSize.toString());
      if (options.status) params.set('status', options.status);
      if (options.category) params.set('category', options.category);
      if (options.severity) params.set('severity', options.severity);
      if (options.departmentId) params.set('departmentId', options.departmentId);
      if (options.teamId) params.set('teamId', options.teamId);
      if (options.reporterId) params.set('reporterId', options.reporterId);
      if (options.fromDate) params.set('fromDate', options.fromDate);
      if (options.toDate) params.set('toDate', options.toDate);
      if (options.search) params.set('search', options.search);
      if (options.sortBy) params.set('sortBy', options.sortBy);
      if (options.sortOrder) params.set('sortOrder', options.sortOrder);

      const response = await fetch(`/api/incidents?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }

      const data: PaginatedResponse<Incident> = await response.json();

      // Convert date strings to Date objects
      const processedIncidents = data.data.map(incident => ({
        ...incident,
        occurredAt: new Date(incident.occurredAt),
        reportedAt: new Date(incident.reportedAt),
        createdAt: new Date(incident.createdAt),
        updatedAt: new Date(incident.updatedAt),
      }));

      setIncidents(processedIncidents);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [
    options.page,
    options.pageSize,
    options.status,
    options.category,
    options.severity,
    options.departmentId,
    options.teamId,
    options.reporterId,
    options.fromDate,
    options.toDate,
    options.search,
    options.sortBy,
    options.sortOrder,
  ]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    pagination,
    isLoading,
    error,
    refresh: fetchIncidents,
  };
}

interface UseIncidentReturn {
  incident: Incident | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIncident(id: string | null): UseIncidentReturn {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncident = useCallback(async () => {
    if (!id) {
      setIncident(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/incidents/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch incident');
      }

      const data = await response.json();

      // Convert date strings to Date objects
      setIncident({
        ...data,
        occurredAt: new Date(data.occurredAt),
        reportedAt: new Date(data.reportedAt),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  return {
    incident,
    isLoading,
    error,
    refresh: fetchIncident,
  };
}

// Hook for creating an incident
export function useCreateIncident() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createIncident = async (data: Record<string, unknown>): Promise<Incident | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create incident');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createIncident, isLoading, error };
}

// Hook for updating incident status
export function useUpdateIncidentStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    incidentId: string,
    status: IncidentStatus,
    reason?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading, error };
}
