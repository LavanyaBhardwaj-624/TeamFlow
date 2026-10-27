import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db.ts'

import { emitWorkspaceEvent } from '../../realtime/socket.ts';


const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;


const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message, status } });

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);


const UpdateTaskStatus = async (req: Request<{taskId: string}>, res: Response, _next: NextFunction): Promise<void> => {

  const userId = req.userId;
  if (!userId) return void fail(res, 401, 'UNAUTHENTICATED', 'Authentication required');

  const { status } = req.body ;

  if ( ( !status) || (status!==undefined && !STATUSES.includes(status)))  
    return void fail(res, 400, 'VALIDATION_ERROR', `Status must be one of: ${STATUSES.join(', ')}`);

  const  { taskId } = req.params;
  if(!isUuid(taskId)){
     return void fail(res , 400 , "INVALID_TASK", "Valid Task id is required");
  }

  const task = await db.orm.public.Task.where({
    id: taskId
  }).include("assignees").first();

  if(!task){
    return void fail(res , 404 ,"TASK_NOT_FOUND", "task not found");
  }

  const workspaceId = task.workspaceId;
  
  const member = await db.orm.public.WorkspaceMember.where({
    workspaceId: workspaceId,
    userId: userId
  }).include("user").first()
   
  if(!member){
    return void fail(res , 404 ,"TASK_NOT_FOUND", "task not found"); 
  }

  const assignee = task.assignees.find( m => m.userId === userId);

  const isTaskCreator = task.createdBy === userId;
  const isWorkspaceAdmin = member.role === 'ADMIN';

if (!isTaskCreator && !isWorkspaceAdmin && !assignee)
  return void fail(res, 403, 'FORBIDDEN', 'Only the task creator or a workspace admin can do this');


  try {
   
    const result = await db.transaction(async (tx) => {
      const updatedtask = await tx.orm.public.Task.where({
         id: taskId,
         workspaceId: workspaceId,
      }).update({
        status: status
      })
      const TaskCreateActivity = await tx.orm.public.TaskActivity.create({
        workspaceId,
        taskId: taskId,
        actorId: userId,
        type: "TASK_MOVED",
        description: `Task is moved to ${status} by the member ${member.user.name}`
      })

      return { task: updatedtask, activity: TaskCreateActivity };
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'status is updated successfully',
      data: result.task,
    });
    emitWorkspaceEvent(workspaceId, 'task:updated', result.task);
    emitWorkspaceEvent(workspaceId, 'activity:created', result.activity);
    return;
  } catch (error) {
    console.error("task Update Status Error -> " + error);
    fail(res, 500, 'INTERNAL_ERROR', 'Internal server error');
    return;
  }
};

export default UpdateTaskStatus;
