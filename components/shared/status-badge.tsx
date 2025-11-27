'use client';

import { Badge } from '@/components/ui/badge';
import { INCIDENT_STATUSES, SEVERITY_LEVELS } from '@/lib/constants';
import type { IncidentStatus, Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = INCIDENT_STATUSES[status];

  return (
    <Badge
      variant="outline"
      className={cn(config.bgColor, config.color, 'border-0 font-medium', className)}
    >
      {config.label}
    </Badge>
  );
}

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_LEVELS[severity];

  return (
    <Badge
      variant="outline"
      className={cn(config.bgColor, config.color, 'border-0 font-medium', className)}
    >
      {config.label}
    </Badge>
  );
}

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  near_miss: { bg: 'bg-purple-100', text: 'text-purple-700' },
  behavioural_issue: { bg: 'bg-orange-100', text: 'text-orange-700' },
  process_gap: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const categoryLabels: Record<string, string> = {
  near_miss: 'Near Miss',
  behavioural_issue: 'Behavioural Issue',
  process_gap: 'Process Gap',
  other: 'Other',
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colors = categoryColors[category] || categoryColors.other;
  const label = categoryLabels[category] || category;

  return (
    <Badge
      variant="outline"
      className={cn(colors.bg, colors.text, 'border-0 font-medium', className)}
    >
      {label}
    </Badge>
  );
}
