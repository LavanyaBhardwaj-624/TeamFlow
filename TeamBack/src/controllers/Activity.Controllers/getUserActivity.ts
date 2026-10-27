
import {type Response , type Request } from 'express';
import { db } from '../../prisma/db.ts'


const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message, status } });

const getUserActivity = async (req: Request<{workspaceId: string}> , res: Response) : Promise<void> => {

   const userId = req.userId;

   
   try{

    const limit  = Number(req.query.limit) || 10;

   //   const { workspaceId } = req?.params;

   //   if(!workspaceId && typeof workspaceId !== "string"){
   //        return void fail(res, 404 , "INVALID_WORKSPACE" , "workpsace not found");
   //   }

   //   const workspace = await db.orm.public.Workspace.where({ id: workspaceId}).first();

   //   if(!workspace){
   //      return void fail(res, 404 , "INVALID_WORKSPACE" , "workpsace not found");
   //   }

   //   const isMember = await db.orm.public.WorkspaceMember.where({
   //      workspaceId: workspaceId,
   //      userId: userId
   //   }).first();

   //   if(!isMember){
   //      return void fail( res , 403 ," AUTHETICATION_FAILED ","unauthorized");
   //   }

     const TaskActivity = await db.orm.public.TaskActivity.where({
         actorId: userId
     })
     .orderBy((i) => i.createdAt.desc())
     .limit(limit)
     .all();
   
        res.status(200).json({
                success: true,
                message: "Workspaces activity retrieved successfully.",
                data: TaskActivity,
                pagination: {
          
                },
                });  


     return;
    
   }catch(err){
           console.log( " get Activites by workpsace  => " + err);
           fail(res , 500 , "INTERNAL_SERVER_ERROR" , "Failed to retrieve workspaces activity due to an internal server error. ")
   }
    
}

export default getUserActivity;