import express from 'express'

const routes = express.Router();

import createWorkspace from '../../controllers/Workspace.controllers/workspace.create.ts'
import { authenticate } from '../../middleware/authenticate.ts';
import getWorkspace from '../../controllers/Workspace.controllers/getWorkspace.ts'
import getAllWorkspace from '../../controllers/Workspace.controllers/getAllWorkspace.ts';
import getAllWorkspaceMembers from '../../controllers/Workspace.controllers/getAllWorkspaceMembers.ts'



routes.post("/workspace/create" , authenticate , createWorkspace)
routes.get("/workspace/get-workspace/:workspaceId" , authenticate , getWorkspace)
routes.get("/workspace/get-all-workspaces" , authenticate ,getAllWorkspace);
routes.get("/workspace/:workspaceId/get-all-members" , authenticate , getAllWorkspaceMembers);

export default routes;
