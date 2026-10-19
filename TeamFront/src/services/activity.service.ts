import { APP_CONFIG } from '@/config/constants';
import { mockActivities, mockUsers } from '@/config/mockData';
import { delay } from '@/lib/utils';
import { Activity, PaginatedResponse } from '@/types';

class ActivityService {
  /**
   * Future endpoint: GET /api/workspaces/:workspaceId/activities -> { data: Activity[], total: number }
   */
  async getActivitiesByWorkspace(workspaceId: string, limit = 15): Promise<PaginatedResponse<Activity>> {
    await delay(APP_CONFIG.mockApiDelayMs);

    const filtered = mockActivities
      .filter((a) => a.workspaceId === workspaceId)
      .slice(0, limit)
      .map((a) => ({
        ...a,
        user: mockUsers.find((u) => u.id === a.userId),
      }));

    return {
      data: filtered,
      total: filtered.length,
    };
  }

  /**
   * Future endpoint: GET /api/activities/recent -> { data: Activity[], total: number }
   */
  async getRecentActivities(limit = 10): Promise<PaginatedResponse<Activity>> {
    await delay(APP_CONFIG.mockApiDelayMs);

    const enriched = mockActivities.slice(0, limit).map((a) => ({
      ...a,
      user: mockUsers.find((u) => u.id === a.userId),
    }));

    return {
      data: enriched,
      total: enriched.length,
    };
  }
}

export const activityService = new ActivityService();

