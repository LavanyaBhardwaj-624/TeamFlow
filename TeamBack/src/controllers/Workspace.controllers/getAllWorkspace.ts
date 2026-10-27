
import {type Request , type Response} from 'express';
import {db} from "../../prisma/db.ts"


const getAllWorkspace = async (req: Request<{workspaceId: string}> , res: Response ) : Promise<void> => {


    const userId = req.userId;
    
    try{
    
          if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required.",
                    status: 401,
                    },
                });
                return;
           }

            const page = Math.max(Number(req.query.page) || 1, 1);
             const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

            const offset = (page - 1) * limit;
            const Items = await db.orm.public.Workspace
              .where((w) => w.members.some((m) => m.userId.eq(userId)))
              .aggregate((a) => ({ total : a.count()}));
            const totalItems = Items.total;
           const workspaces = await db.orm.public.Workspace
             .where((w) => w.members.some((m) => m.userId.eq(userId)))
             .include("members", (members) =>
              members.include("user", (user) =>
             user.select("id", "name", "email", "title", "description", "imageUrl")
            )
        )
        .orderBy((ws) => ws.createdAt.desc())
         .offset(offset)
         .limit(limit)
         .all();
     
         const totalPages = Math.ceil(Number(totalItems) / limit);

                res.status(200).json({
                success: true,
                message: workspaces.length ? "Workspaces retrieved successfully." : "No workspaces found.",
                data: workspaces,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
                });
    return;
    }catch(err){
       console.error("Get workspace error:", err);
       res.status(500).json({
            success: false , 
            error:{
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve workspaces due to an internal server error.",
            status: 500,
            }
        });
        return;
    }

      
}

export default getAllWorkspace;
