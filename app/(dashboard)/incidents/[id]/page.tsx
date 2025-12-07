'use client';

import { use, useCallback, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { IncidentDetail } from '@/components/incidents/incident-detail';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { useIncident } from '@/hooks/use-incidents';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const { incident, isLoading, error, refresh } = useIncident(id);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = useCallback(async (status: string, reason?: string) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/incidents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ status, reason }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        await refresh();
      } else {
        const data = await response.json();
        toast.error('Failed to update status', {
          description: data.error,
        });
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  }, [id, user, refresh]);

  const handleCommentAdd = useCallback(async (body: string, visibility: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/incidents/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ body, visibility }),
      });

      if (response.ok) {
        toast.success('Comment added successfully');
        await refresh();
      } else {
        const data = await response.json();
        toast.error('Failed to add comment', {
          description: data.error,
        });
      }
    } catch {
      toast.error('Failed to add comment');
    }
  }, [id, user, refresh]);

  if (isLoading) {
    return <LoadingPage message="Loading incident..." />;
  }

  if (error || !incident) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/incidents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Link>
        </Button>
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          {error || 'Incident not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/incidents">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Incidents
        </Link>
      </Button>

      <IncidentDetail
        incident={incident}
        onStatusChange={handleStatusChange}
        onCommentAdd={handleCommentAdd}
        isUpdating={isUpdating}
      />
    </div>
  );
}
