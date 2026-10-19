import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, 'Workspace name must be at least 3 characters')
    .max(50, 'Workspace name cannot exceed 50 characters'),
  description: z
    .string()
    .min(8, 'Description must be at least 8 characters')
    .max(250, 'Description cannot exceed 250 characters'),
});

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  userId: z.string().min(1, 'Please select a member to invite'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

