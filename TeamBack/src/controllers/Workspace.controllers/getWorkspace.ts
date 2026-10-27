
import {type Request , type Response} from 'express';
import {db} from "../../prisma/db.ts"


const getWorkspace = async (req: Request<{workspaceId: string}> , res: Response ) : Promise<void> => {


    const userId = req.userId;
    
    try{


    const { workspaceId } = req.params;

    if( !workspaceId || (typeof workspaceId !== 'string')){
        res.status(400).json({
            success: false , 
            error:{
            code: "INVALID_WORKSPACE_ID",
            message: " A valid workspace ID is required",
            status: 400,
        }
        })
        return;
    }
     
    const membership = await db.orm.public.WorkspaceMember.where({ userId, workspaceId }).first();
                                                
            if (!membership) {
                res.status(403).json({
                   success: false,
                    error: {
                   code: "WORKSPACE_ACCESS_DENIED",
                    message: "You do not have access to this workspace.",
                    status: 403
                }
              });  
            return;
            }

        const workspace = await db.orm.public.Workspace
                .where({ id: workspaceId })
                .include("members", (members) =>
                    members.include("user", (user) =>
                    user.select("id", "name", "email", "title", "description", "imageUrl")
                    )
                )
                .first();

        if( !workspace){
            res.status(404).json({
                success: false,
                error: {
                    code: "WORKSPACE_NOT_FOUND",
                    message: "Workspace not found.",
                    status: 404
                }
            });
            return;
        }
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Workspace retrieved successfully',
      data: workspace,   // has multiple members , so workspace.members is an array
    });
    return;
    }catch(err){
       console.log(err);
       res.status(500).json({
            success: false , 
            error:{
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve workspace due to an internal server error.",
            status: 500,
            }
        });
    }

      
}

export default getWorkspace;
