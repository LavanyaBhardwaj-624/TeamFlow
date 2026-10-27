
import {type Response , type Request } from 'express';
import { db } from '../../prisma/db.ts'


const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message, status } });

const getActivitiesByWorkspace = async (req: Request<{workspaceId: string}> , res: Response) : Promise<void> => {

   const userId = req.userId;
      if( !userId ) return void fail( res , 401 , "Authentication_Failure", "Authentication required");
   try{

    const limit  = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const page = Math.max(Number(req.query.page) || 1, 1);

     const { workspaceId } = req?.params;

     if(!workspaceId && typeof workspaceId !== "string"){
          return void fail(res, 404 , "INVALID_WORKSPACE" , "workpsace not found");
     }

     const workspace = await db.orm.public.Workspace.where({ id: workspaceId}).first();

     if(!workspace){
        return void fail(res, 404 , "INVALID_WORKSPACE" , "workpsace not found");
     }

     const isMember = await db.orm.public.WorkspaceMember.where({
        workspaceId: workspaceId,
        userId: userId
     }).first();

     if(!isMember){
        return void fail( res , 403 ," AUTHETICATION_FAILED ","unauthorized");
     }

     const Items = await db.orm.public.TaskActivity.where({ workspaceId }).aggregate((a) => ({
      total : a.count()
     }));
     const totalItems = Items.total;
     const TaskActivity = await db.orm.public.TaskActivity.where({
         workspaceId: workspaceId
     })
     .orderBy((i) => i.createdAt.desc())
     .limit(limit)
     .offset((page - 1) * limit)
     .all();
   
        res.status(200).json({
                success: true,
                message: "Workspaces activity retrieved successfully.",
                data: TaskActivity,
                pagination: {
                  page, limit, totalItems, totalPages: Math.ceil(Number(totalItems) / limit),
                  hasNextPage: page * limit < Number(totalItems), hasPreviousPage: page > 1,
                },
                });  


     return;
    
   }catch(err){
           console.log( " get Activites by workpsace  => " + err);
           fail(res , 500 , "INTERNAL_SERVER_ERROR" , "Failed to retrieve workspaces activity due to an internal server error. ")
   }
    
}

export default getActivitiesByWorkspace;
