import { APP_CONFIG } from '@/config/constants';
import { mockActivities, mockInvitations, mockUsers, mockWorkspaces } from '@/config/mockData';
import { delay } from '@/lib/utils';
import { ApiResponse, PaginatedResponse, Role, Workspace, WorkspaceInvitation } from '@/types';
import { apiClient , getErrorMessage } from '@/lib/api';

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
   * Future endpoint: GET /api/workspaces -> { data: Workspace[], total: number }
   */
  async getWorkspaces(): Promise<PaginatedResponse<Workspace>> {
    await delay(APP_CONFIG.mockApiDelayMs);

    const workspacesWithPopulatedMembers = mockWorkspaces.map((ws) => ({
      ...ws,
      members: ws.members.map((m) => ({
        ...m,
        user: mockUsers.find((u) => u.id === m.userId),
      })),
    }));

    return {
      data: workspacesWithPopulatedMembers,
      total: workspacesWithPopulatedMembers.length,
    };
  }

  /**
   * Future endpoint: GET /api/workspaces/:id -> { data: Workspace }
   */
  async getWorkspaceById(id: string | null): Promise<ApiResponse<Workspace>> {
    await delay(APP_CONFIG.mockApiDelayMs);

    const ws = mockWorkspaces.find((w) => w.id === id);
    if (!ws) {
      throw new Error(`Workspace with id "${id}" not found`);
    }

    const populatedWorkspace: Workspace = {
      ...ws,
      members: ws.members.map((m) => ({
        ...m,
        user: mockUsers.find((u) => u.id === m.userId),
      })),
    };

    return { data: populatedWorkspace };
  }

  /**
   * Future endpoint: POST /api/workspaces -> { data: Workspace }
   */
  async createWorkspace(dto: CreateWorkspaceDTO): Promise<ApiResponse<Workspace>> {


    const slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newWorkspace: Workspace = {
      id: `ws_${Date.now()}`,
      name: dto.name,
      slug: slug ,
      description: dto.description,
      ownerId: dto.ownerId,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: dto.ownerId,
          role: 'ADMIN',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    mockWorkspaces.unshift(newWorkspace);

    // Record activity
    mockActivities.unshift({
      id: `act_${Date.now()}`,
      type: 'WORKSPACE_CREATED',
      description: `created the workspace "${newWorkspace.name}"`,
      workspaceId: newWorkspace.id,
      userId: dto.ownerId,
      createdAt: new Date().toISOString(),
    });

    return {
      data: {
        ...newWorkspace,
        members: newWorkspace.members.map((m) => ({
          ...m,
          user: mockUsers.find((u) => u.id === m.userId),
        })),
      },
      message: 'Workspace created successfully',
    };
  }

  /**
   * Future endpoint: POST /api/workspaces/:id/members -> { data: Workspace }
   */
  // async addMember(workspaceId: string, dto: AddMemberDTO): Promise<ApiResponse<Workspace>> {
  //   await delay(APP_CONFIG.mockApiDelayMs);

  //   const ws = mockWorkspaces.find((w) => w.id === workspaceId);
  //   if (!ws) {
  //     throw new Error(`Workspace "${workspaceId}" not found`);
  //   }

  //   const existingMember = ws.members.find((m) => m.userId === dto.userId);
  //   if (existingMember) {
  //     existingMember.role = dto.role;
  //   } else {
  //     ws.members.push({
  //       userId: dto.userId,
  //       role: dto.role,
  //       joinedAt: new Date().toISOString(),
  //     });
  //   }

  //   const addedUser = mockUsers.find((u) => u.id === dto.userId);
  //   mockActivities.unshift({
  //     id: `act_${Date.now()}`,
  //     type: 'MEMBER_JOINED',
  //     description: `added ${addedUser?.name || 'new member'} as ${dto.role === 'ADMIN' ? 'Admin' : 'Member'}`,
  //     workspaceId,
  //     userId: dto.userId,
  //     createdAt: new Date().toISOString(),
  //   });

  //   return this.getWorkspaceById(workspaceId);
  // }

  async sendInvitation(workspaceId: string, slug: string, dto: InviteMemberDTO, invitedBy: string): Promise<ApiResponse<WorkspaceInvitation>> {

    try{
    const response = await apiClient.post(`/workspaces/${workspaceId}/invitations` , {
      userId: dto.userId,
      role: dto.role,
    })
    return {
      data: response.data.data,
      message: response.data.message ?? 'Invitation sent successfully',
    };
   }catch(err){
    throw new Error(getErrorMessage(err , " Invitation couldn't be Sent! , Please Try Again"))
   }

  }

  async getInvitationsForUser(userId: string): Promise<PaginatedResponse<WorkspaceInvitation>> {
    await delay(APP_CONFIG.mockApiDelayMs);
    const data = mockInvitations.filter((item) => item.invitedUserId === userId && item.status === 'PENDING');
    return { data, total: data.length };
  }

  async getPendingInvitedUserIds(workspaceId: string): Promise<string[]> {
    await delay(APP_CONFIG.mockApiDelayMs);
    return mockInvitations.filter((item) => item.workspaceId === workspaceId && item.status === 'PENDING').map((item) => item.invitedUserId);
  }

  async respondToInvitation(invitationId: string, userId: string, response: 'ACCEPTED' | 'DECLINED'): Promise<ApiResponse<WorkspaceInvitation>> {

    try{
    const server_response = await apiClient.post(`/invitations/${invitationId}/respond` , {
      
      userId: userId,
      response: response,
    })
    return {
      data: server_response.data.data,
      message: server_response.data.message ?? `Invitation ${response.toLowerCase()} successfully`,
    }
   }catch(err){
    throw new Error(getErrorMessage(err , `Invitation couldn't be ${response.toLowerCase()} , Due to server error! , Please try again`))
   }
  }
}

export const workspaceService = new WorkspaceService();
