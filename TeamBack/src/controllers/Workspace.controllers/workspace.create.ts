
import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db.ts';
import { emitWorkspaceEvent } from '../../realtime/socket.ts';


const fail = (res: Response, status: number, message: string) => {
        res.status(status).json({
            success: false , 
            error:{
            code: "WORKSPACE_CREATION_ERR",
            message: message,
            status: status,
            }
        });
};
const createWorkspace = async (req: Request , res:Response , next: NextFunction ) : Promise<void> => {

    // first create workspace -> then record activity.
      const ownerId = req.userId;
      if( !ownerId ) return fail( res , 401 , "Authentication required");
    const { body } = req;

    // create workspace 
    const {name , slug , description } = body;
   
    try{
    
    if (!name?.trim())
    return fail(res, 400, "Workspace name is required");
    if (name.length > 100)
    return fail(res, 400, "Workspace name is too long");
   if (description && description.length > 5000)
   return fail(res, 400, "Description too long");
    if (!slug?.trim())
    return fail(res, 400, "Slug is required");
    
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug))
     return fail(res, 400, "Invalid slug");
  

    
    const admin = await db.orm.public.User.where({
      id: ownerId
    }).first();

    if(!admin) return fail(res , 404 ,   "User not found");

    const existingWorkspace =
      await db.orm.public.Workspace.where({
      slug
     }).first();

    if (existingWorkspace) {
      return fail(res, 409, "Workspace slug already exists");
    }
  const result = await db.transaction(async (tx) => {

    const workspace = await tx.orm.public.Workspace.create({
      name,
      slug,
      description,
      createdBy: ownerId,
    });

    const member = await tx.orm.public.WorkspaceMember.create({
      workspaceId: workspace.id,
      userId: ownerId,
      role: "ADMIN",
    });

    const activity = await tx.orm.public.TaskActivity.create({
      workspaceId: workspace.id,
      actorId: ownerId,
      type: "WORKSPACE_CREATED",
      description: `${admin.name} created workspace "${workspace.name}"`,
    });

       return {
         workspace,
         member,
         activity,
       };

  });

   res.status(201).json({
      success: true,
      status: 201,
      message: `Workspace has been created Successfully`,
      data: result,
    });
   emitWorkspaceEvent(result.workspace.id, 'workspace:created', result);
   emitWorkspaceEvent(result.workspace.id, 'activity:created', result.activity);

    return;

} catch (error) {
   console.error(error);
   return fail(res, 500, "Internal Server Error");
}
}

export default createWorkspace
