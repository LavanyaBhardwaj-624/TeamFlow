import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
  dueDate: z.string().min(1, 'Please specify a due date'),
  assigneeId: z.string().min(1, 'Please select an assignee'),
  tagsString: z.string().optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

