export type Role = 'ADMIN' | 'MEMBER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  title?: string;
  createdAt?: string;
}

export interface WorkspaceMember {
  userId: string;
  role: Role;
  joinedAt?: string;
  user?: User; // Populated representation
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt?: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED';

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  invitedBy: string;
  inviterName: string;
  /** invitedUserId is available when the backend populates it (admin view) */
  invitedUserId?: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
  workspaceId: string;
  creatorId: string;
  assigneeId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  type: 'TASK_CREATED' | 'TASK_MOVED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'MEMBER_JOINED' | 'WORKSPACE_CREATED' | 'INVITATION_SENT' | 'INVITATION_DECLINED';
  description: string;
  workspaceId: string;
  userId: string;
  taskId?: string;
  createdAt: string;
  user?: User; // Populated representation
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
export interface pagination{
  limit: string | number,
  totalItems: string | number,
  totalPage: string | number,
  hasNextPage: boolean,
  hasPreviousPage: boolean,  
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  message?: string,
  pagination: pagination
}

export interface AuthSession {
  user: User;
  token: string;
}
