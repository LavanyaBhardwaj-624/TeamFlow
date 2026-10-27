import { ApiResponse, PaginatedResponse, Task, TaskPriority, TaskStatus } from '@/types';
import { apiClient , getErrorMessage} from '@/lib/api';
export interface CreateTaskDTO {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
  workspaceId: string;
  creatorId: string;
  assigneeId: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
  assigneeId?: string;
}

class TaskService {
  /**
   * Future endpoint: GET /api/workspaces/:workspaceId/tasks -> { data: Task[], total: number }
   */
  async getTasksByWorkspace(workspaceId: string | null): Promise<PaginatedResponse<Task>> {
    if (!workspaceId) return { data: [], total: 0 };
    // const tasks = mockTasks.filter((t) => t.workspaceId === workspaceId);
    try{
      const server_response = await apiClient.get(`/api/Task/${workspaceId}/get-tasks`);
      return {
        data: (server_response.data?.data ?? []).map((task: { id: string; title: string; description?: string; status: TaskStatus; priority: TaskPriority; dueAt?: string; tags?: string[]; workspaceId: string; createdBy: string; createdAt?: string; updatedAt?: string; assignees?: Array<{ userId: string }> }) => ({
          ...task,
          description: task.description ?? '',
          dueDate: task.dueAt ?? '',
          creatorId: task.createdBy,
          assigneeId: task.assignees?.[0]?.userId ?? '',
        })),
        total: server_response.data?.data?.length || 0,
    };
    }catch(err){
      throw new Error(getErrorMessage(err , ` Failed to retrieve workspaces tasks`));
    }

  }

  /**
   * Future endpoint: GET /api/tasks/:id -> { data: Task }
   */
  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    // await delay(APP_CONFIG.mockApiDelayMs);
    // const task = mockTasks.find((t) => t.id === id);
    // if (!task) {
    //   throw new Error(`Task with id "${id}" not found`);
    // }
    // return { data: task };
    try{
    const server_response = await apiClient.get(`/api/Task/${id}`);
      return {
        data: server_response.data?.data,
    };
    }catch(err){
      throw new Error(getErrorMessage(err , ` Failed to retrieve tasks`));
    }
  }

  /**
   * Future endpoint: POST /api/workspaces/:workspaceId/tasks -> { data: Task }
   */
  async createTask(dto: CreateTaskDTO): Promise<ApiResponse<Task>> {
    // const newTask: Task = {
    //   id: `task_${Date.now()}`,
    //   title: dto.title,
    //   description: dto.description,
    //   status: 'TODO',
    //   priority: dto.priority,
    //   dueDate: dto.dueDate,
    //   tags: dto.tags.length > 0 ? dto.tags : ['General'],
    //   workspaceId: dto.workspaceId,
    //   creatorId: dto.creatorId,
    //   assigneeId: dto.assigneeId,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    // };

    // mockTasks.unshift(newTask);

    // Record activity
    // mockActivities.unshift({
    //   id: `act_${Date.now()}`,
    //   type: 'TASK_CREATED',
    //   description: `created task "${newTask.title}"`,
    //   workspaceId: newTask.workspaceId,
    //   userId: dto.creatorId,
    //   taskId: newTask.id,
    //   createdAt: new Date().toISOString(),
    // });
  

    try {
      const server_response = await apiClient.post(`/api/Task/workspace/create` , {
      title: dto.title,
      description: dto.description,
      status: 'TODO',
      priority: dto.priority,
      dueDate: dto.dueDate,
      tags: dto.tags.length > 0 ? dto.tags : ['General'],
      workspaceId: dto.workspaceId,
      creatorId: dto.creatorId,
      assigneeId: dto.assigneeId,
  
      });
      // server_response.data.data also contain the taskAssigned , TaskCreateActivity , TaskAssignedActivity so if you need them
      return {
        data: { ...server_response.data?.data.task, dueDate: server_response.data?.data.task?.dueAt ?? '', creatorId: server_response.data?.data.task?.createdBy, assigneeId: dto.assigneeId },
        message: server_response.data.message
      };
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to create Task. Please try again.'));
    }
  }
  

  /**
   * Future endpoint: PATCH /api/tasks/:id/status -> { data: Task }
   */
  async updateTaskStatus(id: string, newStatus: TaskStatus, userId: string): Promise<ApiResponse<Task>> {

    // await delay(120); // Faster latency for smooth drag-and-drop feedback
    // const task = mockTasks.find((t) => t.id === id);
    // if (!task) {
    //   throw new Error(`Task "${id}" not found`);
    // }

    // const oldStatus = task.status;
    // if (oldStatus !== newStatus) {
    //   task.status = newStatus;
    //   task.updatedAt = new Date().toISOString();

    //   const statusLabels: Record<TaskStatus, string> = {
    //     TODO: 'To Do',
    //     IN_PROGRESS: 'In Progress',
    //     DONE: 'Completed',
    //   };

    //   mockActivities.unshift({
    //     id: `act_${Date.now()}`,
    //     type: 'TASK_MOVED',
    //     description: `moved "${task.title}" to ${statusLabels[newStatus]}`,
    //     workspaceId: task.workspaceId,
    //     userId,
    //     taskId: task.id,
    //     createdAt: new Date().toISOString(),
    //   });
    // }
   try{
    const server_response = await apiClient.patch(`/api/Task/${id}/updateTaskStatus`, {
      status: newStatus,
      userId
    })

    return { 
      data:{...server_response.data.data }
    }
  }catch(err){
       throw new Error(getErrorMessage(err, 'Failed to Update task status. Please try again.'));
  }
}

  /**
   * Future endpoint: PATCH /api/tasks/:id -> { data: Task }
   */
  async updateTask(id: string, updates: UpdateTaskDTO, userId: string): Promise<ApiResponse<Task>> {
    // await delay(APP_CONFIG.mockApiDelayMs);
    // const taskIndex = mockTasks.findIndex((t) => t.id === id);
    // if (taskIndex === -1) {
    //   throw new Error(`Task "${id}" not found`);
    // }

    // const existing = mockTasks[taskIndex];
    // const updatedTask: Task = {
    //   ...existing,
    //   ...updates,
    //   updatedAt: new Date().toISOString(),
    // };

    // mockTasks[taskIndex] = updatedTask;

    // mockActivities.unshift({
    //   id: `act_${Date.now()}`,
    //   type: 'TASK_UPDATED',
    //   description: `updated details for "${updatedTask.title}"`,
    //   workspaceId: updatedTask.workspaceId,
    //   userId,
    //   taskId: updatedTask.id,
    //   createdAt: new Date().toISOString(),
    // });

     //{ title, description, status, priority, dueDate, tags, assigneeId }
    try{
    const server_response = await apiClient.patch(`/api/Task/${id}/updatetask`, {
         title: updates.title,
         description: updates.description,
         status: updates.status,
         priority: updates.priority,
         dueDate: updates.dueDate,
         tags: updates.tags,
         ...(updates.assigneeId ? { assigneeId: updates.assigneeId } : {})
    })

    return { 
      data: server_response.data.data ,
      message: server_response.data.message
    }
  }catch(err){
       throw new Error(getErrorMessage(err, 'Failed to Update task. Please try again.'));
  }
    // return { data: updatedTask, message: 'Task updated successfully' };
  }

  /**
   * Future endpoint: DELETE /api/tasks/:id -> { message: string }
   */
  async deleteTask(id: string, userId: string): Promise<ApiResponse<{ id: string }>> {
    // await delay(APP_CONFIG.mockApiDelayMs);
    // const index = mockTasks.findIndex((t) => t.id === id);
    // if (index === -1) {
    //   throw new Error(`Task "${id}" not found`);
    // }

    // const [deleted] = mockTasks.splice(index, 1);

    // mockActivities.unshift({
    //   id: `act_${Date.now()}`,
    //   type: 'TASK_DELETED',
    //   description: `deleted task "${deleted.title}"`,
    //   workspaceId: deleted.workspaceId,
    //   userId,
    //   taskId: deleted.id,
    //   createdAt: new Date().toISOString(),
    // });

    try{
       const server_response = await apiClient.delete(`/api/Task/${id}/Delete` );
       return{
        data: { id },
        message: server_response.data.message
       }
        
    }catch(err){
       throw new Error(getErrorMessage(err, 'Failed to Delete task. Please try again.'));
    }
 
  }
}

export const taskService = new TaskService();

