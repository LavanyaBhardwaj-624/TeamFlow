import express from 'express';
import { authenticate } from '../../middleware/authenticate.ts';
import { listMyWorkspaceInvitations, respondToWorkspaceInvitation, sendWorkspaceInvitation } from '../../controllers/Workspace.controllers/workspace.invitation.ts';
import WorkspaceInvitation from "../../controllers/Workspace.controllers/getPendingRequests.ts"
const router = express.Router();
router.get('/invitations', authenticate, listMyWorkspaceInvitations);
router.post('/workspaces/:workspaceId/sendinvitations', authenticate, sendWorkspaceInvitation);
router.post('/invitations/:invitationId/respond', authenticate, respondToWorkspaceInvitation);
router.post('/workspace/:workspaceId/invitations' , authenticate , WorkspaceInvitation);

export default router;
