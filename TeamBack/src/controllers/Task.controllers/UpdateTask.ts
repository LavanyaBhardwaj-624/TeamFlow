import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db.ts'
import parseDueDate from '../../utility/parseDate.ts';
import { emitWorkspaceEvent } from '../../realtime/socket.ts';
import { Temporal } from "@js-temporal/polyfill";

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message, status } });

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

// parseDueDate from above goes here

const UpdateTask = async (req: Request<{taskId: string}>, res: Response, _next: NextFunction): Promise<void> => {

  const userId = req.userId;
  if (!userId) return void fail(res, 401, 'UNAUTHENTICATED', 'Authentication required');

  const  { taskId } = req.params;
  if(!isUuid(taskId)){
     return void fail(res , 400 , "INVALID_TASK", "Valid Task id is required");
  }

  const prevtask = await db.orm.public.Task.where({
    id: taskId
  }).include("creator").first();

  if(!prevtask){
    return void fail(res , 404 ,"TASK_NOT_FOUND", "task not found");
  }


  const workspaceId = prevtask.workspaceId;
  
  const member = await db.orm.public.WorkspaceMember.where({
    workspaceId: workspaceId,
    userId: userId
  }).include("user").first()
   
  if(!member){
    return void fail(res , 404 ,"TASK_NOT_FOUND", "task not found"); 
  }
  const isTaskCreator = prevtask.createdBy === userId;
const isWorkspaceAdmin = member.role === 'ADMIN';

if (!isTaskCreator && !isWorkspaceAdmin)
  return void fail(res, 403, 'FORBIDDEN', 'Only the task creator or a workspace admin can do this');

  const Updater = member.user.name

  const { title, description, status, priority, dueDate, tags, assigneeId } = req.body ?? {};
  const normalizedAssigneeId = typeof assigneeId === 'string' && assigneeId.trim() ? assigneeId.trim() : undefined;

  if (title !== undefined && (typeof title !== 'string' || !title.trim()))
    return void fail(res, 400, 'VALIDATION_ERROR', 'Task title is required');
  if (title !== undefined && title.trim().length > 100)
    return void fail(res, 400, 'VALIDATION_ERROR', 'Task title must be 100 characters or less');

  if (description !== undefined && (typeof description !== 'string' || description.length > 5000))
    return void fail(res, 400, 'VALIDATION_ERROR', 'Description must be a string of at most 5000 characters');


  if (status!==undefined && !STATUSES.includes(status))  // if status is not undefiend the check => its content
    return void fail(res, 400, 'VALIDATION_ERROR', `Status must be one of: ${STATUSES.join(', ')}`);

  if (priority!== undefined && !PRIORITIES.includes(priority))
    return void fail(res, 400, 'VALIDATION_ERROR', `Priority must be one of: ${PRIORITIES.join(', ')}`);

  if (tags !== undefined &&
      (!Array.isArray(tags) || tags.length > 10 ||
       tags.some((t) => typeof t !== 'string' || !t.trim() || t.length > 30)))
    return void fail(res, 400, 'VALIDATION_ERROR', 'Tags must be up to 10 non-empty strings (max 30 chars each)');


    const due = parseDueDate(dueDate);
    if (!due.ok) return void fail(res, 400, 'VALIDATION_ERROR', due.message);
  
     let assigneeMembership = null;

    if (normalizedAssigneeId !== undefined && !isUuid(normalizedAssigneeId)) {
      return void fail(res, 400, 'INVALID_ASSIGNEE', 'Valid assignee ID is required');
    }

    if (normalizedAssigneeId !== undefined) {
        assigneeMembership = await db.orm.public.WorkspaceMember
        .where({ workspaceId, userId: normalizedAssigneeId })
        .include("user")
       .first();

      if (!assigneeMembership) {
       fail(res, 400, 'INVALID_ASSIGNEE', 'Assignee is not a member of this workspace');
        return;
      }
    }

     
   const newDate =  due.value !== null ? Temporal.Instant.from(due.value.toISOString())
                   : prevtask.dueAt;

  try {
   
    const result = await db.transaction(async (tx) => {
      const task = await tx.orm.public.Task.where({
         id: taskId,
         workspaceId: workspaceId,
      }).include("assignees").update({
         title: title ?? prevtask.title,
         description: description ?? prevtask.description,
         status: status ?? prevtask.status,
         priority: priority ?? prevtask.priority,
         tags: tags ?? prevtask.tags,
         dueAt: newDate
      });

    
      if( assigneeMembership ){
       const taskAssigned = await tx.orm.public.TaskAssignee.create({
        workspaceId,
        taskId: taskId,
        userId: normalizedAssigneeId,
      });
      const TaskAssignedActivity = await tx.orm.public.TaskActivity.create({
        workspaceId,
        taskId: taskId,
        actorId: userId,
        type: "TASK_ASSIGNED",
        description: `A task  is assigned to the member ${assigneeMembership.user.name} by the member ${Updater}`
      })
     }

      const TaskCreateActivity = await tx.orm.public.TaskActivity.create({
        workspaceId,
        taskId: taskId,
        actorId: userId,
        type: "TASK_UPDATED",
        description: `A task  is updated by the member ${Updater}`
      })

      if(status && status !== prevtask.status){
        await tx.orm.public.TaskActivity.create({
        workspaceId,
        taskId: taskId,
        actorId: userId,
        type: "TASK_MOVED",
        description: `Task is moved to ${status} by the ${member.role} ${Updater}`
      })
      }

      return task;
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Task Updated successfully',
      data: result,
    });
    emitWorkspaceEvent(workspaceId, 'task:updated', result);
    return;
  } catch (error) {
    console.error("Update Task error -> " + error);
    fail(res, 500, 'INTERNAL_ERROR', 'Internal server error');
    return;
  }
};

export default UpdateTask;
