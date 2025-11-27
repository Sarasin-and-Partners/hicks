'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Plus, Pencil, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { IncidentType } from '@/lib/types';

export default function IncidentTypesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingType, setEditingType] = useState<IncidentType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const fetchIncidentTypes = async () => {
    try {
      const response = await fetch('/api/incident-types');
      if (response.ok) {
        const data = await response.json();
        setIncidentTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch incident types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentTypes();
  }, []);

  const handleOpenDialog = (type?: IncidentType) => {
    if (type) {
      setEditingType(type);
      setFormData({ name: type.name, description: type.description || '' });
    } else {
      setEditingType(null);
      setFormData({ name: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const url = editingType
        ? `/api/incident-types/${editingType.id}`
        : '/api/incident-types';
      const method = editingType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingType
            ? 'Incident type updated successfully'
            : 'Incident type created successfully'
        );
        setIsDialogOpen(false);
        fetchIncidentTypes();
      } else {
        const data = await response.json();
        toast.error('Failed to save incident type', {
          description: data.error,
        });
      }
    } catch (error) {
      toast.error('Failed to save incident type');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Incident Types</CardTitle>
              <CardDescription>
                Manage the types of incidents that users can select when reporting
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingType ? 'Edit Incident Type' : 'Create Incident Type'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingType
                        ? 'Update the incident type details below'
                        : 'Add a new incident type that users can select'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name *
                      </label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Data Entry Error"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Brief description of this incident type"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingType ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : incidentTypes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No incident types configured. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidentTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {type.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={type.isActive ? 'default' : 'secondary'}
                      >
                        {type.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(type)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
