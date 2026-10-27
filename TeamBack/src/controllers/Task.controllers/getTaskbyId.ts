
import {type Response , type Request } from 'express';
import { db } from '../../prisma/db.ts'


const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message, status } });

const getTaskById = async (req: Request<{taskId: string}> , res: Response) : Promise<void> => {

   const userId = req.userId;
      if( !userId ) return void fail( res , 401 , "Authentication_Failure", "Authentication required");
   try{

     const { taskId } = req?.params;

     if(!taskId && typeof taskId !== "string"){
          return void fail(res, 404 , "INVALID_TASK" , "task not found");
     }

     const task = await db.orm.public.Task.where({ id: taskId}).first();

     if(!task){
        return void fail(res, 404 , "INVALID_TASk" , "task not found");
     }

     const isMember = await db.orm.public.WorkspaceMember.where({
        workspaceId: task.workspaceId,
        userId: userId
     }).first();

     if(!isMember){
        return void fail( res , 403 ," AUTHETICATION_FAILED ","unauthorized");
     }

   
        res.status(200).json({
                success: true,
                message: " Tasks retrieved successfully.",
                data: task,
                });  


     return;
    
   }catch(err){
           console.log( " get Activites by workpsace  => " + err);
           fail(res , 500 , "INTERNAL_SERVER_ERROR" , "Failed to retrieve tasks due to an internal server error. ")
   }
    
}

export default getTaskById;