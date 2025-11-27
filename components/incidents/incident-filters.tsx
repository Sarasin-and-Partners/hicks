'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/shared/date-picker';
import { INCIDENT_STATUSES, INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '@/lib/constants';
import type { IncidentStatus, IncidentCategory, Severity, Department } from '@/lib/types';
import { Search, X } from 'lucide-react';

export interface IncidentFilters {
  search?: string;
  status?: IncidentStatus;
  category?: IncidentCategory;
  severity?: Severity;
  departmentId?: string;
  fromDate?: string;
  toDate?: string;
}

interface IncidentFiltersProps {
  filters: IncidentFilters;
  onFiltersChange: (filters: IncidentFilters) => void;
}

export function IncidentFiltersComponent({ filters, onFiltersChange }: IncidentFiltersProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Sync searchValue when filters.search changes (e.g., from URL)
  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        if (response.ok) {
          setDepartments(await response.json());
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue || undefined });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.category ||
    filters.severity ||
    filters.departmentId ||
    filters.fromDate ||
    filters.toDate;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {/* Filter Dropdowns */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === 'all' ? undefined : (value as IncidentStatus),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(INCIDENT_STATUSES).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              category: value === 'all' ? undefined : (value as IncidentCategory),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(INCIDENT_CATEGORIES).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.severity || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              severity: value === 'all' ? undefined : (value as Severity),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {Object.entries(SEVERITY_LEVELS).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.departmentId || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              departmentId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-4">
        <DateRangePicker
          from={filters.fromDate ? new Date(filters.fromDate) : undefined}
          to={filters.toDate ? new Date(filters.toDate) : undefined}
          onValueChange={(range) =>
            onFiltersChange({
              ...filters,
              fromDate: range.from?.toISOString(),
              toDate: range.to?.toISOString(),
            })
          }
          placeholder="Filter by date range"
          className="flex-1"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
