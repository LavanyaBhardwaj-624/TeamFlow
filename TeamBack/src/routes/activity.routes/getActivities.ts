
import express from 'express';

const router = express.Router();

import getActivitiesByWorkspace from '../../controllers/Activity.Controllers/getActivitiesByWorkspace.ts';
import { authenticate } from '../../middleware/authenticate.ts';
import getUserActivity from '../../controllers/Activity.Controllers/getUserActivity.ts';

router.get("/:workspaceId" , authenticate , getActivitiesByWorkspace);
router.get("/user" , authenticate , getUserActivity);
export default router
