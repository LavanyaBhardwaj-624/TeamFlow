import { ApiResponse, PaginatedResponse, Role, Workspace, WorkspaceInvitation } from '@/types';
import { apiClient, getErrorMessage } from '@/lib/api';

export interface CreateWorkspaceDTO {
  name: string;
  description: string;
  ownerId: string;
}

export interface AddMemberDTO {
  userId: string;
  role: Role;
}

export interface InviteMemberDTO {
  userId: string;
  role: Role;
}

class WorkspaceService {
  /**
   * GET /api/workspace/get-all-workspaces?page=&limit=
   */
  async getWorkspaces(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Workspace>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    try {
      const server_response = await apiClient.get(`/workspace/get-all-workspaces?${params.toString()}`);
      return {
        data: server_response.data.data,
        total: server_response.data.pagination?.totalItems ?? 0,
        message: server_response.data.message,
        pagination: server_response.data.pagination,
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to fetch workspaces. Please try again.'));
    }
  }

  /**
   * GET /api/workspace/get-workspace/:id
   */
  async getWorkspaceById(id: string | null): Promise<ApiResponse<Workspace>> {
    if (!id) throw new Error('No workspace ID provided');

    try {
      const server_response = await apiClient.get(`/workspace/get-workspace/${id}`);
      return {
        data: server_response.data.data,
        message: server_response.data.message,
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to load workspace. Please try again.'));
    }
  }

  /**
   * POST /api/Workspace/create
   */
  async createWorkspace(dto: CreateWorkspaceDTO): Promise<ApiResponse<Workspace>> {
    const slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    try {
      const server_response = await apiClient.post(`/api/Workspace/create`, {
        name: dto.name,
        slug: slug,
        description: dto.description,
        ownerId: dto.ownerId,
      });
      return {
        data: server_response.data.data,
        message: server_response.data.message ?? 'Workspace created successfully',
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Workspace creation failed. Please try again.'));
    }
  }

  /**
   * POST /api/workspaces/:id/sendinvitations
   */
  async sendInvitation(
    workspaceId: string,
    slug: string,
    dto: InviteMemberDTO,
    invitedBy: string,
  ): Promise<ApiResponse<WorkspaceInvitation>> {
    try {
      const response = await apiClient.post(`/api/workspaces/${workspaceId}/sendinvitations`, {
        userId: dto.userId,
        role: dto.role,
      });
      return {
        data: response.data.data,
        message: response.data.message ?? 'Invitation sent successfully',
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to send invitation. Please try again.'));
    }
  }

  /**
   * GET /api/invitations?page=&limit=
   * Returns all pending invitations for the currently authenticated user (identified by cookie/token).
   */
  async getInvitationsForUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<WorkspaceInvitation>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    try {
      const server_response = await apiClient.get(`/api/invitations?${params.toString()}`);
      return {
        data: server_response.data.data,
        total: server_response.data.pagination?.totalItems ?? 0,
        message: server_response.data.message,
        pagination: server_response.data.pagination,
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to fetch invitations. Please try again.'));
    }
  }

  /**
   * GET /workspace/:id/invitations?page=&limit=
   * Returns full WorkspaceInvitation objects for pending invites in a workspace (admin view).
   */
  async getPendingInvitedUserIds(
    workspaceId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedResponse<WorkspaceInvitation>> {
    if (!workspaceId) {
      return { data: [], total: 0, pagination: { limit, totalItems: 0, totalPage: 0, hasNextPage: false, hasPreviousPage: false } };
    }

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    try {
      const server_response = await apiClient.get(`/workspace/${workspaceId}/invitations?${params.toString()}`);
      return {
        data: server_response.data.data,
        total: server_response.data.pagination?.totalItems ?? 0,
        message: server_response.data.message,
        pagination: server_response.data.pagination,
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to fetch pending invitations.'));
    }
  }

  /**
   * POST /api/invitations/:id/respond
   */
  async respondToInvitation(
    invitationId: string,
    userId: string,
    response: 'ACCEPTED' | 'DECLINED',
  ): Promise<ApiResponse<WorkspaceInvitation>> {
    try {
      const server_response = await apiClient.post(`/api/invitations/${invitationId}/respond`, {
        userId: userId,
        response: response,
      });
      return {
        data: server_response.data.data,
        message:
          server_response.data.message ??
          `Invitation ${response === 'ACCEPTED' ? 'accepted' : 'declined'} successfully`,
      };
    } catch (err) {
      throw new Error(
        getErrorMessage(
          err,
          `Could not ${response.toLowerCase()} the invitation. Please try again.`,
        ),
      );
    }
  }
}

export const workspaceService = new WorkspaceService();
