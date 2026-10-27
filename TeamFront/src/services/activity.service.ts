import { apiClient, getErrorMessage } from '@/lib/api';
import { Activity, PaginatedResponse } from '@/types';

class ActivityService {
  /**
   * Future endpoint: GET /api/workspaces/:workspaceId/activities -> { data: Activity[], total: number }
   */
  async getActivitiesByWorkspace(workspaceId: string, limit = 15, page = 1): Promise<PaginatedResponse<Activity>> {
    // const filtered = mockActivities
    //   .filter((a) => a.workspaceId === workspaceId)
    //   .slice(0, limit)
    //   .map((a) => ({
    //     ...a,
    //     user: mockUsers.find((u) => u.id === a.userId),
    //   }));

    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
     try{
    const server_response = await apiClient.get(`/api/activity/${workspaceId}?${params.toString()}`);
    return {
      data: server_response.data?.data,
      total: server_response.data?.pagination?.totalItems ?? server_response.data?.data.length ?? 0,
      pagination: server_response.data?.pagination,
    };
  }catch(err){
    throw new Error(getErrorMessage(err , " Failed to retrieve workspaces actvities."))
  }
  }

  /**
   * Future endpoint: GET /api/activities/recent -> { data: Activity[], total: number }
   */
  async getRecentActivities(limit = 10): Promise<PaginatedResponse<Activity>> {
  

    const params = new URLSearchParams({
      limit: String(limit),
    });
   try{
    const server_response = await apiClient.get(`/api/activity/user/${params.toString()}`);
    return {
      data: server_response.data?.data,
      total: server_response.data?.data.length || 0,
    };
  }catch(err){
    throw new Error(getErrorMessage(err ,  "Failed to retrieve recent workspaces actvities."))
  }
  }
}

export const activityService = new ActivityService();

