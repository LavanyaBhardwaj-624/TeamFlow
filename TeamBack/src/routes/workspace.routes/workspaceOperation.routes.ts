import express from 'express'

const routes = express.Router();

import createWorkspace from '../../controllers/Workspace.controllers/workspace.create.ts'
import { authenticate } from '../../middleware/authenticate.ts';
import getWorkspace from '../../controllers/Workspace.controllers/getWorkspace.ts'
import getAllWorkspace from '../../controllers/Workspace.controllers/getAllWorkspace.ts';

routes.post("/workspace/create" , authenticate , createWorkspace)
routes.post("/workspace/get-workspace/:workspaceId" , authenticate , getWorkspace)
routes.post("/workspace/get-all-workspaces" , authenticate ,getAllWorkspace);


export default routes;