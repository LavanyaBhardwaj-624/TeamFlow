import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db.ts'
import parseDueDate from '../../utility/parseDate.ts';
import { emitWorkspaceEvent } from '../../realtime/socket.ts';
import { Temporal } from "@js-temporal/polyfill";

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message, status } });

// parseDueDate from above goes here

const createTask = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.userId;
  if (!userId) return void fail(res, 401, 'UNAUTHENTICATED', 'Authentication required');

  const { title, description, status, priority, dueDate, tags, workspaceId, assigneeId } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim())
    return void fail(res, 400, 'VALIDATION_ERROR', 'Task title is required');
  if (title.trim().length > 100)
    return void fail(res, 400, 'VALIDATION_ERROR', 'Task title must be 100 characters or less');

  if (description !== undefined && (typeof description !== 'string' || description.length > 5000))
    return void fail(res, 400, 'VALIDATION_ERROR', 'Description must be a string of at most 5000 characters');

  const taskStatus = status ?? 'TODO';
  if (!STATUSES.includes(taskStatus))
    return void fail(res, 400, 'VALIDATION_ERROR', `Status must be one of: ${STATUSES.join(', ')}`);

  if (!PRIORITIES.includes(priority))
    return void fail(res, 400, 'VALIDATION_ERROR', `Priority must be one of: ${PRIORITIES.join(', ')}`);

  if (typeof workspaceId !== 'string' || typeof assigneeId !== 'string')
    return void fail(res, 400, 'VALIDATION_ERROR', 'workspaceId and assigneeId are required');

  if (tags !== undefined &&
      (!Array.isArray(tags) || tags.length > 10 ||
       tags.some((t) => typeof t !== 'string' || !t.trim() || t.length > 30)))
    return void fail(res, 400, 'VALIDATION_ERROR', 'Tags must be up to 10 non-empty strings (max 30 chars each)');

  const due = parseDueDate(dueDate);
  if (!due.ok) return void fail(res, 400, 'VALIDATION_ERROR', due.message);

  try {
   
    const creatorMembership = await db.orm.public.WorkspaceMember
      .where({ workspaceId, userId }).include("user").first();
    if (!creatorMembership){
       fail(res, 403, 'WORKSPACE_MEMBERSHIP_REQUIRED', 'You must be a member of this workspace to create a task');
    return
    }
    const assigneeMembership = await db.orm.public.WorkspaceMember
      .where({ workspaceId, userId: assigneeId }).include("user").first();
    if (!assigneeMembership){
      fail(res, 400, 'INVALID_ASSIGNEE', 'Assignee is not a member of this workspace');
       return;
    }
    const workspace = await db.orm.public.Workspace.where({
      id:workspaceId
    }).first();

    if(!workspace){
      fail(res , 404 , "INVALID_WORKSPACE" , "Workspace not found");
      return;
    }
    const result = await db.transaction(async (tx) => {
      const task = await tx.orm.public.Task.create({
        workspaceId,
        createdBy: userId,
        title: title.trim(),
        status: taskStatus,
        priority,
        description,
        tags: tags?.length ? tags : ['General'],
        dueAt: due.value
                ? Temporal.Instant.from(due.value.toISOString())
                : null,
      });

      const taskAssigned = await tx.orm.public.TaskAssignee.create({
        workspaceId,
        taskId: task.id,
        userId: assigneeId,
      });


      const TaskCreateActivity = await tx.orm.public.TaskActivity.create({
  
        workspaceId,
        taskId: task.id,
        actorId: userId,
        type: "TASK_CREATED",
        description: `A task  is created by the member ${creatorMembership.user.name} to the member ${assigneeMembership.user.name}`
      })

      const TaskAssignedActivity = await tx.orm.public.TaskActivity.create({
        workspaceId,
        taskId: task.id,
        actorId: userId,
        type: "TASK_ASSIGNED",
        description: `A task  is assigned to the member ${assigneeMembership.user.name} by the member ${creatorMembership.user.name}`
      })

      return { task, taskAssigned , TaskCreateActivity , TaskAssignedActivity };
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Task is created and assigned successfully',
      data: result,
    });
    emitWorkspaceEvent(workspaceId, 'task:created', result);
    emitWorkspaceEvent(workspaceId, 'activity:created', result.TaskCreateActivity);
    return;
  } catch (error) {
    console.error(error);
    fail(res, 500, 'INTERNAL_ERROR', 'Internal server error');
    return;
  }
};

export default createTask;
