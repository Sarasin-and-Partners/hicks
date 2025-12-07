'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createIncidentSchema, type CreateIncidentInput } from '@/lib/validations/incident';
import { useUser } from '@/hooks/use-user';

type IncidentFormValues = z.input<typeof createIncidentSchema>;
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSelector } from '@/components/shared/user-selector';
import { MultiSelect, type MultiSelectOption } from '@/components/shared/multi-select';
import { DatePicker } from '@/components/shared/date-picker';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '@/lib/constants';
import type { Department, Team, Process, IncidentType, User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface IncidentFormProps {
  onSubmit: (data: CreateIncidentInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function IncidentForm({ onSubmit, isSubmitting = false }: IncidentFormProps) {
  const { user } = useUser();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      reporterId: user?.id || '',
      departmentId: user?.departmentId || '',
      teamId: user?.teamId || undefined,
      category: 'near_miss',
      severity: 'medium',
      description: '',
      associatedPersonIds: [],
      associatedTeamIds: [],
      associatedProcessIds: [],
      privacyFlag: false,
    },
  });

  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [deptRes, teamRes, procRes, typeRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/teams'),
          fetch('/api/processes'),
          fetch('/api/incident-types'),
        ]);

        if (deptRes.ok) setDepartments(await deptRes.json());
        if (teamRes.ok) setTeams(await teamRes.json());
        if (procRes.ok) setProcesses(await procRes.json());
        if (typeRes.ok) setIncidentTypes(await typeRes.json());
      } catch (error) {
        console.error('Failed to fetch reference data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.setValue('reporterId', user.id);
      form.setValue('departmentId', user.departmentId);
      if (user.teamId) {
        form.setValue('teamId', user.teamId);
      }
    }
  }, [user, form]);

  // Filter teams by selected department
  const selectedDepartmentId = form.watch('departmentId');
  const filteredTeams = teams.filter(
    (team) => !team.departmentId || team.departmentId === selectedDepartmentId
  );

  // Handle reporter change - auto-populate department
  const handleReporterChange = useCallback((userId: string, selectedUser?: User) => {
    form.setValue('reporterId', userId);
    if (selectedUser?.departmentId) {
      form.setValue('departmentId', selectedUser.departmentId);
      if (selectedUser.teamId) {
        form.setValue('teamId', selectedUser.teamId);
      }
    }
  }, [form]);

  // Convert reference data to MultiSelect options
  const teamOptions: MultiSelectOption[] = filteredTeams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const processOptions: MultiSelectOption[] = processes.map((process) => ({
    value: process.id,
    label: process.name,
    description: process.description || undefined,
  }));

  const handleFormSubmit = async (data: IncidentFormValues) => {
    // Convert to proper output type for the API
    const submitData: CreateIncidentInput = {
      ...data,
      severity: data.severity || 'medium',
      associatedPersonIds: data.associatedPersonIds || [],
      associatedTeamIds: data.associatedTeamIds || [],
      associatedProcessIds: data.associatedProcessIds || [],
      privacyFlag: data.privacyFlag || false,
    };
    await onSubmit(submitData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Reporter & Department Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reporter Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="reporterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reported By *</FormLabel>
                  <FormControl>
                    <UserSelector
                      value={field.value}
                      onValueChange={handleReporterChange}
                      placeholder="Select reporter..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occurredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Incident *</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onValueChange={(date) => {
                        field.onChange(date ? date.toISOString() : undefined);
                      }}
                      maxDate={new Date()}
                      placeholder="Select date"
                    />
                  </FormControl>
                  <FormDescription>
                    When did the incident occur?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Incident Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(INCIDENT_CATEGORIES).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex flex-col">
                            <span>{config.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {config.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incidentTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incidentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SEVERITY_LEVELS).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <span className={config.color}>{config.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the incident in detail..."
                        className="min-h-[150px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0} / 2000 characters (minimum 5)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Associations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Associations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="associatedTeamIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Teams</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={teamOptions}
                      value={field.value || []}
                      onValueChange={field.onChange}
                      placeholder="Select teams..."
                    />
                  </FormControl>
                  <FormDescription>
                    Teams related to this incident
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="associatedProcessIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Processes</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={processOptions}
                      value={field.value || []}
                      onValueChange={field.onChange}
                      placeholder="Select processes..."
                    />
                  </FormControl>
                  <FormDescription>
                    Processes related to this incident
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="privacyFlag"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as Private</FormLabel>
                      <FormDescription>
                        Private incidents are only visible to HoD and Risk Office
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Incident
          </Button>
        </div>
      </form>
    </Form>
  );
}
