'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, SeverityBadge, CategoryBadge } from '@/components/shared/status-badge';
import { StatusChangeForm } from '@/components/forms/status-change-form';
import { CommentForm } from '@/components/forms/comment-form';
import { useUser, useHasRole } from '@/hooks/use-user';
import type { Incident, Comment, StatusHistoryEntry } from '@/lib/types';
import {
  Clock,
  User,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  MessageSquare,
  History,
  Lock,
} from 'lucide-react';

interface IncidentDetailProps {
  incident: Incident;
  onStatusChange?: (status: string, reason?: string) => Promise<void>;
  onCommentAdd?: (body: string, visibility: string) => Promise<void>;
  isUpdating?: boolean;
}

export function IncidentDetail({
  incident,
  onStatusChange,
  onCommentAdd,
  isUpdating = false,
}: IncidentDetailProps) {
  const { user } = useUser();
  const canChangeStatus = useHasRole(['hod']);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{incident.incidentNumber}</h1>
            {incident.privacyFlag && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={incident.currentStatus} />
            <SeverityBadge severity={incident.severity} />
            <CategoryBadge category={incident.category} />
          </div>
        </div>

        {canChangeStatus && (
          <Button onClick={() => setStatusDialogOpen(true)}>
            Change Status
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{incident.description}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Comments
                {incident.comments && (
                  <Badge variant="secondary">{incident.comments.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incident.comments && incident.comments.length > 0 ? (
                <div className="space-y-4">
                  {incident.comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}

              <Separator />

              {user && onCommentAdd && (
                <CommentForm
                  incidentId={incident.id}
                  onSubmit={async (data) => {
                    await onCommentAdd(data.body, data.visibility || 'public');
                  }}
                  placeholder="Add a comment..."
                />
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.statusHistory && incident.statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {incident.statusHistory.map((entry) => (
                    <StatusHistoryItem key={entry.id} entry={entry} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No status changes recorded</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Key Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailRow
                icon={<Clock className="h-4 w-4" />}
                label="Occurred"
                value={format(new Date(incident.occurredAt), 'dd MMM yyyy HH:mm')}
              />
              <DetailRow
                icon={<Clock className="h-4 w-4" />}
                label="Reported"
                value={format(new Date(incident.reportedAt), 'dd MMM yyyy HH:mm')}
              />
              <Separator />
              <DetailRow
                icon={<User className="h-4 w-4" />}
                label="Reporter"
                value={incident.reporter?.displayName || 'Unknown'}
              />
              <DetailRow
                icon={<Building2 className="h-4 w-4" />}
                label="Department"
                value={incident.department?.name || 'Unknown'}
              />
              {incident.team && (
                <DetailRow
                  icon={<Users className="h-4 w-4" />}
                  label="Team"
                  value={incident.team.name}
                />
              )}
              {incident.incidentType && (
                <DetailRow
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="Type"
                  value={incident.incidentType.name}
                />
              )}
            </CardContent>
          </Card>

          {/* Associated Items */}
          {(incident.associatedTeams?.length || incident.associatedProcesses?.length) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Associations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incident.associatedTeams && incident.associatedTeams.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Teams</p>
                    <div className="flex flex-wrap gap-1">
                      {incident.associatedTeams.map((link) => (
                        <Badge key={link.id} variant="secondary">
                          {link.team?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {incident.associatedProcesses && incident.associatedProcesses.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Processes</p>
                    <div className="flex flex-wrap gap-1">
                      {incident.associatedProcesses.map((link) => (
                        <Badge key={link.id} variant="secondary">
                          {link.process?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status Change Dialog */}
      {onStatusChange && (
        <StatusChangeForm
          currentStatus={incident.currentStatus}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          onSubmit={async (data) => {
            await onStatusChange(data.status, data.reason);
          }}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {comment.author?.displayName || 'Unknown'}
          </span>
          {comment.visibility === 'private' && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Lock className="h-3 w-3" />
              Private
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(comment.createdAt), 'dd MMM yyyy HH:mm')}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
    </div>
  );
}

function StatusHistoryItem({ entry }: { entry: StatusHistoryEntry }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {entry.fromStatus && (
            <>
              <StatusBadge status={entry.fromStatus} className="text-xs" />
              <span className="text-muted-foreground">→</span>
            </>
          )}
          <StatusBadge status={entry.toStatus} className="text-xs" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {entry.changer?.displayName || 'Unknown'} •{' '}
          {format(new Date(entry.changedAt), 'dd MMM yyyy HH:mm')}
        </p>
        {entry.reason && (
          <p className="mt-1 text-xs text-muted-foreground">{entry.reason}</p>
        )}
      </div>
    </div>
  );
}
