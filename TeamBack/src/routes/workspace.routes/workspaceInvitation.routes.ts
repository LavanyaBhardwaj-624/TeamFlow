import express from 'express';
import { authenticate } from '../../middleware/authenticate.ts';
import { listMyWorkspaceInvitations, respondToWorkspaceInvitation, sendWorkspaceInvitation } from '../../controllers/Workspace.controllers/workspace.invitation.ts';

const router = express.Router();
router.get('/invitations', authenticate, listMyWorkspaceInvitations);
router.post('/workspaces/:workspaceId/invitations', authenticate, sendWorkspaceInvitation);
router.post('/invitations/:invitationId/respond', authenticate, respondToWorkspaceInvitation);

export default router;
