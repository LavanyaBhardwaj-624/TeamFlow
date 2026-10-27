import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db.ts'

import { emitWorkspaceEvent } from '../../realtime/socket.ts';


const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message, status } });

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);



const DeleteTask = async (req: Request<{taskId: string}>, res: Response, _next: NextFunction): Promise<void> => {

  const userId = req.userId;
  if (!userId) return void fail(res, 401, 'UNAUTHENTICATED', 'Authentication required');

  const  { taskId } = req.params;
  if(!isUuid(taskId)){
     return void fail(res , 400 , "INVALID_TASK", "Valid Task id is required");
  }

  const task = await db.orm.public.Task.where({
    id: taskId
  }).first();

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
  const isTaskCreator = task.createdBy === userId;
const isWorkspaceAdmin = member.role === 'ADMIN';

if (!isTaskCreator && !isWorkspaceAdmin)
  return void fail(res, 403, 'FORBIDDEN', 'Only the task creator or a workspace admin can do this');

  const name = member.user.name

  try {
   
    const result = await db.transaction(async (tx) => {
      
        const task = await tx.orm.public.Task.where({
            id: taskId,
            workspaceId: workspaceId,
        }).delete();

        const taskActivity = await tx.orm.public.TaskActivity.create({
                workspaceId,
                taskId: taskId,
                actorId: userId,
                type: "TASK_DELETED",
                description: `Task is Deleted by the ${member.role} ${member.user.name}`
        })
      return task;
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Task Deleted successfully',
      data: result,
    });
    emitWorkspaceEvent(workspaceId, 'task:updated', { id: taskId, deleted: true });
    return;
  } catch (error) {
    console.error(error);
    fail(res, 500, 'INTERNAL_ERROR', 'Internal server error');
    return;
  }
};

export default DeleteTask;
