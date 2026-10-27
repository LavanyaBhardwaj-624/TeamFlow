
import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db.ts';


const getAllMember = async (req: Request<{workspaceId: string}> , res:Response , next: NextFunction ) : Promise<void> => {

        const userId = req.userId;
        try{

          const {workspaceId} = req.params;

      if(!workspaceId){
        res.status(400).json({
            success: false , 
            error:{
            code: "WORKSPACE_MEMBER_FETCH_ERROR",
            message: "valid workspace id is required",
            status: 400,
            }
        });
        return;
      }  
        const isUser_A_Memebr = await db.orm.public.WorkspaceMember.where({
           workspaceId: workspaceId ,
            userId: userId
          }).first()
        
          if(!isUser_A_Memebr){
            res.status(403).json({
            success: false , 
            error:{
            code: "WORKSPACE_MEMBER_FETCH_ERROR",
            message: "User is Forbid to access the Workspace memeber",
            status: 403,
            }
        });
        return;
        }

         const workspacemember = await db.orm.public.WorkspaceMember.where({
            workspaceId: workspaceId,
         }).include("user").all();

          const Members = workspacemember.map((m) => {
           return { 
                     userId: m.userId,
                     id: m.user.id,
                     email: m.user.email,
                     description: m.user.description,
                     name: m.user.name,
                     title: m.user.title,
                     role: m.role,
                     joinedAt: m.joinedAt,
                     image: m.user.imageUrl,
                     user: { id: m.user.id, name: m.user.name, email: m.user.email, title: m.user.title, description: m.user.description, image: m.user.imageUrl },
           }
          }).filter((member): member is NonNullable<typeof member> => Boolean(member))


                res.status(200).json({
                success: true,
                message: "Workspace Members are retrieve succesfully.",
                data: Members,
                });

          return;
        }catch(err){
          console.log(` get All workspace Members error -> ` + err);
        }
}

export default getAllMember;
