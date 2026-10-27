
import {type Request , type Response, type NextFunction} from 'express';
import {db} from "../../prisma/db.ts"
import { and } from "@prisma/orm-postgres/orm-client";

const fail = (res: Response, status: number, message: string) => {
        res.status(status).json({
            success: false , 
            error:{
            code: "INVITATION_FETCH_ERROR",
            message: message,
            status: status,
            }
        });
};

const currentUser = async (req: Request) => db.orm.public.User.where({ 
    id: req.userId 
}).first();

 const getPendingUserId = async (req: Request<{workspaceId: string}>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const actor = await currentUser(req);
    if (!actor)
       return fail(res, 401, 'Authentication required');
    
            const { workspaceId } = req.params;
            if (!workspaceId ) {
            return fail(res, 400, 'Workspace ID is required');
            }

            const workspace = await db.orm.public.Workspace
            .where({ id: workspaceId })
            .where((w) =>
                w.members.some((m) =>
                  and(m.userId.eq(actor.id), m.role.eq("ADMIN"))
                )
            )
            .first();
      
            if(!workspace) return fail(res , 401 , `unauthorized , only admin of workspace can only see invitations sent to others,
                if workspace exist`);

    
          const page = Math.max(Number(req.query.page) || 1, 1);
          const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

          const offset = (page - 1)*limit;
          const total_invites = await db.orm.public.WorkspaceInvitation.where({
               workspaceId: workspaceId,
               status: 'PENDING'
             }).count();


                    const invitations = await db.orm.public.WorkspaceInvitation
                        .where({
                            workspaceId: workspaceId,
                            status: "PENDING",
                        })
                        .include("inviter", (inviter) =>
                            inviter.select("id", "name", "email")
                        )
                        .select("id","email","role","status","expiresAt","createdAt")
                        .orderBy((i) => i.createdAt.desc())
                        .offset(offset)
                        .limit(limit)
                        .all();
    
      const totalPages = Math.ceil(Number(total_invites)/limit);

     res.status(200).json({
      success: true,
      status: 200,
      message: 'Invitations retrieved successfully',
      data: invitations,
      pagination: {
          page,
          limit,
          total_invites,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
      },
    });
    return;
  } catch (error) {
          res.status(500).json({
            success: false , 
            error:{
            code: "SERVER_ERR",
            message: "Failed to retrieve invitations due to an internal server error",
            status: 500,
            }
        });
    }
    return;
};
export default getPendingUserId
