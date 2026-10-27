import express from "express"
const routes = express.Router();

import createchannels  from "../../controllers/Chat.controllers/channelcreate.ts"
import { editChannel } from "../../controllers/Chat.controllers/editChannel.ts"
import { authenticate } from "../../middleware/authenticate.ts"

// list channels

import {ListChannel , GetMember , GetJoinRequest} from 
"../../controllers/Chat.controllers/listChannel.ts"



import {Joinpublic, respondToJoin , Joinprivate , AddDirectly} from
 "../../controllers/Chat.controllers/channelJoin.ts"


import { DelelteChannel, removeMember, memberleave } from "../../controllers/Chat.controllers/Delete.controllers.ts";

import { TransferOwnership } from "../../controllers/Chat.controllers/transferOwnership.ts";


routes.post("/:workspaceId/create" , authenticate , createchannels)
routes.patch("/:channelId/edit" , authenticate , editChannel)


routes.get("/:workspaceId/list" , authenticate, ListChannel);
routes.get("/:channelId/member" , authenticate , GetMember)
routes.get("/request" , authenticate , GetJoinRequest)

routes.post("/:channelId/public/join" , authenticate , Joinpublic)
routes.post("/:channelId/private/join/request" , authenticate , Joinprivate)
routes.post("/private/:requestId/response" , authenticate , respondToJoin)
routes.post("/:channelId/direct/add" , authenticate , AddDirectly)

routes.delete("/:channelId/delete" , authenticate , DelelteChannel)
routes.delete("/:channelId/remove/:memberId" , authenticate , removeMember)
routes.delete("/:channelId/leave" , authenticate , memberleave)

routes.post("/:channelId/transfer/owner/:memberId" , authenticate , TransferOwnership)

export default routes