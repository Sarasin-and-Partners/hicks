'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { statusChangeSchema, type StatusChangeInput } from '@/lib/validations/incident';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { INCIDENT_STATUSES, STATUS_TRANSITIONS } from '@/lib/constants';
import type { IncidentStatus } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface StatusChangeFormProps {
  currentStatus: IncidentStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StatusChangeInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function StatusChangeForm({
  currentStatus,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: StatusChangeFormProps) {
  const availableStatuses = STATUS_TRANSITIONS[currentStatus];

  const form = useForm<StatusChangeInput>({
    resolver: zodResolver(statusChangeSchema),
    defaultValues: {
      status: availableStatuses[0],
      reason: '',
    },
  });

  const handleSubmit = async (data: StatusChangeInput) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedStatus = form.watch('status');
  const requiresReason = selectedStatus === 'closed' || currentStatus === 'closed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <DialogDescription>
            Update the incident status from{' '}
            <span className="font-medium">{INCIDENT_STATUSES[currentStatus].label}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStatuses.map((status) => {
                        const config = INCIDENT_STATUSES[status];
                        return (
                          <SelectItem key={status} value={status}>
                            <span className={config.color}>{config.label}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason {requiresReason && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a reason for the status change..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {requiresReason
                      ? 'A reason is required for this status change'
                      : 'Optional: Explain why the status is changing'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
