import express from 'express';
import { authenticate } from '../../middleware/authenticate.ts';
import createTask from '../../controllers/Task.controllers/createTask.ts';
import UpdateTask from '../../controllers/Task.controllers/UpdateTask.ts';
import UpdateTaskStatus from '../../controllers/Task.controllers/taskUpdateStatus.ts';
import DeleteTask from '../../controllers/Task.controllers/deleteTask.ts';
import getTasksByWorkspace from '../../controllers/Task.controllers/getTaskbyWorkspace.ts';
import getTaskById from '../../controllers/Task.controllers/getTaskbyId.ts';
const router = express.Router();

router.post("/workspace/create" , authenticate , createTask);
router.patch("/:taskId/updatetask" , authenticate , UpdateTask);
router.patch("/:taskId/updateTaskStatus" , authenticate , UpdateTaskStatus);
router.delete("/:taskId/Delete" , authenticate , DeleteTask);
router.get("/:workspaceId/get-tasks" , authenticate , getTasksByWorkspace)
router.get("/:taskId" , authenticate , getTaskById );
export default router;
