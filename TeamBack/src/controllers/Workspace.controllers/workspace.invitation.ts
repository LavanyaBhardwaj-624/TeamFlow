import { createHash, randomBytes } from 'node:crypto';
import { type NextFunction, type Request, type Response } from 'express';
import { db } from '../../prisma/db.ts';



const invitationExpiryDays = 7;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

const fail = (res: Response, status: number, message: string) => {
        res.status(status).json({
            success: false , 
            error:{
            code: "INVITATION_ERROR",
            message: message,
            status: status,
            }
        });
};
//success: false, error: { code: 'INVITATION_ERROR', message, status }
const currentUser = async (req: Request) => db.orm.public.User.where({ 
    id: req.userId 
}).first();

export const sendWorkspaceInvitation = async (req: Request<{ workspaceId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const actor = await currentUser(req);

    const { workspaceId } = req.params;

    const requestedUserId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';

    // const requestedEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const role = req.body?.role === 'ADMIN' ? 'ADMIN' : 'MEMBER';

    if (!actor) return fail(res, 401, 'Authentication required');

    if (!workspaceId || (!requestedUserId)) {
      return fail(res, 400, 'Workspace ID and recipient user ID are required');
    }

    const membership = await db.orm.public.WorkspaceMember.where({ 
      workspaceId, userId: actor.id 
    }).first();
    if (!membership || membership.role !== 'ADMIN')
       return fail(res, 403, 'Only workspace admins can send invitations');

    const recipient =  await db.orm.public.User.where({ id: requestedUserId }).first()
      
    const workspace = await db.orm.public.Workspace.where({ id: workspaceId }).first();

    if (!recipient || !workspace)
       return fail(res, 404, 'Workspace or user not found');

    const email = recipient.email.trim().toLowerCase();

    if (await db.orm.public.WorkspaceMember.where({ workspaceId, userId: recipient.id }).first())
       return fail(res, 409, 'This user is already a member');

    if (await db.orm.public.WorkspaceInvitation.where({ 
      workspaceId, email, status: 'PENDING' 
    }).first())
       return fail(res, 409, 'An invitation , for same user, is already pending');

    const rawToken = randomBytes(32).toString('hex');
   await db.transaction(async (tx) => {

    const invitation = await tx.orm.public.WorkspaceInvitation.create({
      workspaceId,
      invitedBy: actor.id,
      email,
      role,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + invitationExpiryDays * 24 * 60 * 60 * 1000),
    });
    await tx.orm.public.TaskActivity.create({ 
      workspaceId, 
      actorId: actor.id, type: 'INVITATION_SENT', 
      description: `Invited ${recipient.name || recipient.email} to ${workspace.name}`
     });

    
    // res.status(201).json({ success: true, data: { ...invitation, token: rawToken }, message: 'Invitation sent successfully' });
    
    return res.status(201).json({
      success: true,
      status: 201,
      message: `Invitation sent successfully to ${recipient.name || recipient.email}.
                The invitation will expire in 7 days. `,
      data: {
        ...invitation,
        
      },
    });

  });

  } catch (error) {
     console.error(error);

     return fail( res, 500, 'Internal Server Error');
    }
    return;
};




export const listMyWorkspaceInvitations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const actor = await currentUser(req);
    if (!actor)
       return fail(res, 401, 'Authentication required');
 
          const page = Math.max(Number(req.query.page) || 1, 1);
          const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

          const offset = (page - 1)*limit;
          const total_invites = await db.orm.public.WorkspaceInvitation.where({
               email: actor.email, 
               status: 'PENDING'
             }).count();
          const invitations = await db.orm.public.WorkspaceInvitation
            .where({
              email: actor.email,
              status: "PENDING",
            }).include("workspace").include("inviter")
            .orderBy((i) => i.createdAt.asc())
            .offset(offset)
            .limit(limit)
            .all();
    
      const totalPages = Math.ceil(Number(total_invites)/limit);

      const newInvitations = invitations.map(i =>{
        return {
                id: i.id ,
                workspaceId: i.workspaceId,
                workspaceName: i.workspace.name,
                invitedBy: i.invitedBy,
                inviterName: i.inviter.name,
                email: i.email,
                role: i.role,
                status: i.status,
                createdAt: i.createdAt,
        }
      })
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Invitations retrieved successfully',
      data: newInvitations,
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



export const respondToWorkspaceInvitation = async (req: Request<{ invitationId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const actor = await currentUser(req);

    if (!actor) return fail(res, 401, 'Authentication required');

    if( !req.body.response ) return fail(res , 400, 'Invitation response is required')

    const validResponses = ['ACCEPTED', 'DECLINED'];

    if (!validResponses.includes(req.body.response))
   return fail(res, 400, 'Invalid invitation action');

    const response = req.body?.response;

    const invitation = req.params.invitationId ? await db.orm.public.WorkspaceInvitation.where({ id: req.params.invitationId, email: actor.email, status: 'PENDING' }).first() : null;

    if (!response || !invitation) return fail(res, 404, 'Invitation is no longer available');

    if (new Date(invitation.expiresAt).getTime() < Date.now()) return fail(res, 410, 'Invitation has expired');

   await db.transaction(async (tx) => {

  if (response === 'ACCEPTED') {

    await tx.orm.public.WorkspaceMember.create({
      workspaceId: invitation.workspaceId,
      userId: actor.id,
      role: invitation.role,
    });

    await tx.orm.public.TaskActivity.create({
      workspaceId: invitation.workspaceId,
      actorId: actor.id,
      type: 'MEMBER_JOINED',
      description: `${actor.email} joined the workspace`,
    });
  }else{
    await tx.orm.public.TaskActivity.create({
       workspaceId: invitation.workspaceId,
        actorId: actor.id,
         type: 'INVITATION_DECLINED', 
         description: `${actor.email} declined the invitation`
    });
 
  }

  await tx.orm.public.WorkspaceInvitation
    .where({ id: invitation.id })
    .update({
      status: response,
      ...(response === 'ACCEPTED'
        ? { acceptedAt: new Date() }
        : { declinedAt: new Date() }),
    });

});
    res.status(200).json({
      success: true,
      status: 200,
      message: ` Invitation successfully ${response.toLowerCase()} .`,
      data: {
        ...invitation,
      },
      });
  } catch (error) { 
          res.status(500).json({
            success: false , 
            error:{
            code: "SERVER_ERR",
            message: "Invitation could not be sent due to an internal server error",
            status: 500,
            }
        });
   }
};


