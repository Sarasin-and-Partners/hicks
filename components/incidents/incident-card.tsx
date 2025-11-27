'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge, SeverityBadge, CategoryBadge } from '@/components/shared/status-badge';
import type { Incident } from '@/lib/types';
import { Clock, User, Building2 } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  return (
    <Link href={`/incidents/${incident.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-muted-foreground">
                  {incident.incidentNumber}
                </span>
                <StatusBadge status={incident.currentStatus} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={incident.severity} />
              <CategoryBadge category={incident.category} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {incident.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(incident.occurredAt), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{incident.reporter?.displayName || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>{incident.department?.name || 'Unknown'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
