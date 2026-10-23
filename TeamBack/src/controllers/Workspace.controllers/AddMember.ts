
import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db';
import { workers } from 'node:cluster';

const AddMember = async (req: Request , res:Response , next: NextFunction ) : Promise<void> => {

    // first creste workspace -> then record activity.

    const { body } = req;

   const {workspaceId , ownerId , role }   = body
    try{

            const member = await db.orm.public.WorkspaceMember.create({
                workspaceId: workspaceId,
                userId: ownerId,
                role: "ADMIN"
            })
    }catch(err){
        
    }
}

export default AddMember;
/**
 *   const newWorkspace: Workspace = {
       id: `ws_${Date.now()}`,
       name: dto.name,
       slug: slug ,
       description: dto.description,
       ownerId: dto.ownerId,
       createdAt: new Date().toISOString(),
       members: [
         {
           userId: dto.ownerId,
           role: 'ADMIN',
           joinedAt: new Date().toISOString(),
         },
       ],
     };
 */