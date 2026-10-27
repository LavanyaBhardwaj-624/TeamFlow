import express from "express"

const routes = express.Router()

import { postMessage } from "../../controllers/message.controllers/PostMessages.ts"
import { GetMessage  } from "../../controllers/message.controllers/getMessages.ts"
import { EditMessage } from "../../controllers/message.controllers/EditMessages.ts"
import { DeleteMessage } from "../../controllers/message.controllers/DeleteMessages.ts"
import { authenticate } from "../../middleware/authenticate.ts"

routes.post("/:channelId/post" , authenticate , postMessage)
routes.get("/:channelId/get" , authenticate, GetMessage)
routes.patch("/:channelId/edit/:messageId" , authenticate , EditMessage)
routes.delete("/:channelId/delete/:messageId" , authenticate , DeleteMessage)


export default routes