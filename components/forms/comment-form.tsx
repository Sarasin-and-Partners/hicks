'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCommentSchema, type CreateCommentInput } from '@/lib/validations/incident';
import { useUser, useHasRole } from '@/hooks/use-user';

type CommentFormValues = z.input<typeof createCommentSchema>;
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';

interface CommentFormProps {
  incidentId: string;
  parentId?: string;
  onSubmit: (data: CreateCommentInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

export function CommentForm({
  incidentId,
  parentId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder = 'Add a comment...',
}: CommentFormProps) {
  const { user } = useUser();
  const canAddPrivate = useHasRole(['hod', 'risk_office']);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      body: '',
      visibility: 'public',
      parentId: parentId || null,
    },
  });

  const handleSubmit = async (data: CommentFormValues) => {
    await onSubmit({
      ...data,
      visibility: data.visibility || 'public',
    });
    form.reset();
  };

  if (!user) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  className="min-h-[80px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canAddPrivate && (
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private (HoD/Risk)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Post
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
