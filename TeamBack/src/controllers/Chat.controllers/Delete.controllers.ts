
import {type Request , type Response , type NextFunction} from "express"
import { db } from "../../prisma/db.ts"
import { emitWorkspaceEvent, emitChannelEvent } from "../../realtime/socket.ts"



// delete channel


const ErrorRes = function (res: Response , status: number, code: string , message: string) {

    res.status(status).json({
        success: false,
        error:{
          status: status,
          code: code,
          message: message,
        }
    })
}
// channelid -> in params
const DelelteChannel = async (req: Request<{channelId: string}>, res: Response) => {

    const userId = req.userId
    if(!userId) {
       return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
    }

    try{

        const { channelId } = req.params
        if( !channelId || typeof channelId !== "string"){
          return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid chat channel");
        }

        const isMember = await db.orm.public.ChannelMember.where({
            channelId: channelId,
            memberId: userId
        }).first();

        if(!isMember || isMember.role !== "OWNER"){
            return ErrorRes(res , 401 , " UNAUTHORIZED" , "user is not authorized to delete channel");
        }
        const channel = await db.orm.public.ChatChannel.where({ id: channelId }).first();

        const deleteChatChannel = await db.orm.public.ChatChannel.where({
            id: channelId
        }).delete()
    if (channel) {
      emitWorkspaceEvent(channel.workspaceId, "channel:deleted", { id: channel.id, name: channel.name, type: channel.type, description: channel.description });
      emitChannelEvent(channel.id, "channel:deleted", { id: channel.id });
    }

    res.status(200).json({
        success: true,
        status: 200,
        message: "Chat channels deleted successfully",
        data: deleteChatChannel,
      })

        
    }
    catch(err){
      console.log(" Delete Channel error -> " + err)
      ErrorRes( res , 500 , "INTERNA_SERVER_ERROR" , " chat channel deletion fail due to internal server error")
      return;
    }

}

export {DelelteChannel}

// admin / creator --> remove a specific member
// channelId , memberId in params
const removeMember = async (req: Request<{channelId: string , memberId: string}>, res: Response) : Promise<void> => {

    const userId = req.userId
    if(!userId) {
       return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
    }

    try{

        const { channelId } = req.params
        if( !channelId || typeof channelId !== "string"){
          return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid chat channel");
        }
        const { memberId } = req.params
        if( !memberId || typeof memberId !== "string"){
          return ErrorRes(res, 400 , "INVALID_MEMBER" , "invalid Member");
        }
       
        const isUserMember = await db.orm.public.ChannelMember.where({
            channelId : channelId,
            memberId  : userId
        }).include("channel").first();

        // if isMember is exist -> means a channel exit and user is channel member then => it is also ws member

        if(!isUserMember || isUserMember.role !== "OWNER"){
            return ErrorRes(res , 400 , "UNAUTHORIZED" ,"user is not authorized to do this activity");
        }

        const isAdmin = await db.orm.public.WorkspaceMember.where({
             workspaceId: isUserMember.workspaceId,
             userId: userId,
        }).first()

        if( !isAdmin  || isUserMember.channel.type === "PUBLIC" && isAdmin.role !== "ADMIN"){
           return ErrorRes(res , 400 , "UNAUTHORIZED" ,"user is not authorized to do this activity");
        }
     
        const deleteMember = await db.orm.public.ChannelMember.where({
            memberId: memberId,
            channelId: channelId
        }).delete()

        
    res.status(200).json({
        success: true,
        status: 200,
        message: "member removed successfully",
        data: deleteMember
      })
    return
    }catch(err){
      console.log(" Member removal from channel error -> " + err)
      ErrorRes( res , 500 , "INTERNA_SERVER_ERROR" , " Member Removal fail due to internal server error")
      return;
    }

}

export {removeMember}


// channel Id
const memberleave = async (req: Request<{channelId: string}> , res: Response): Promise<void> => {

    const userId = req.userId
    if(!userId) {
       return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
    }
    try{
        const { channelId } = req.params
        if( !channelId || typeof channelId !== "string"){
          return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid chat channel");
        }
        const isUserMember = await db.orm.public.ChannelMember.where({
            channelId : channelId,
            memberId  : userId
        }).include("channel").first();

        if(!isUserMember){  // either channelId is wrong or memeberId is wrong. in both case user not found
            return ErrorRes(res , 404 , "USER_NOT_FOUND" , "user is not found")
        }

        if(isUserMember.role === "OWNER"){
            return ErrorRes(res , 400 , "INVALID_REQUEST" , " please transfer channel ownership to other member")
        }
        
        const delMember =  await db.orm.public.ChannelMember.where({
            channelId : channelId,
            memberId  : userId
        }).delete();
        emitChannelEvent(channelId, "member:left", { channelId, memberId: userId });

    res.status(200).json({
        success: true,
        status: 200,
        message: "User is removed from chat channel successfully",
        data: delMember
      })

      return

    }
    catch(err){
      console.log(" Member leave error -> " + err)
      ErrorRes( res , 500 , "INTERNA_SERVER_ERROR" , " Member reamoval fail due to internal server error")
      return;
    }
}

export {memberleave};
