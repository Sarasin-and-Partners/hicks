'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { IncidentForm } from '@/components/forms/incident-form';
import { useUser } from '@/hooks/use-user';
import { useCreateIncident } from '@/hooks/use-incidents';
import type { CreateIncidentInput } from '@/lib/validations/incident';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewIncidentPage() {
  const router = useRouter();
  const { user } = useUser();
  const { createIncident, isLoading, error } = useCreateIncident();

  const handleSubmit = async (data: CreateIncidentInput) => {
    const result = await createIncident({
      ...data,
      reporterId: data.reporterId || user?.id,
    });

    if (result) {
      toast.success('Incident created successfully', {
        description: `Incident ${result.incidentNumber} has been submitted`,
      });
      router.push(`/incidents/${result.id}`);
    } else if (error) {
      toast.error('Failed to create incident', {
        description: error,
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/incidents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report New Incident</CardTitle>
          <CardDescription>
            Submit details about a conduct or behaviour incident or near miss.
            All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncidentForm onSubmit={handleSubmit} isSubmitting={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
