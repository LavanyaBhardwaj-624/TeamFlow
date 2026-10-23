import express from 'express'

const routes = express.Router();

import createWorkspace from '../../controllers/Workspace.controllers/workspace.create.ts'
import { authenticate } from '../../middleware/authenticate.ts';
import AddMember from "../../controllers/Workspace.controllers/AddMember.ts"

routes.post("/CreateWorkspace" , authenticate , createWorkspace , AddMember )