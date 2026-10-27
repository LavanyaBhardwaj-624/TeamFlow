import {type Request , type Response , type NextFunction} from "express"
import { db } from "../../prisma/db"

async function Channelmember(channelId: string , userId : string) : Promise<any>{

    const channelmember = await db.orm.public.ChannelMember.where({
       channelId: channelId,
       memberId: userId
     }).include("membership").first();

     return {
         isMember: !!channelmember,
         member: channelmember
     }
}

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

// channel id and memberId in params
const TransferOwnership = async(req: Request<{channelId: string , memberId: string }> , res: Response): Promise<void> => {

 const userId = req.userId;
  if(!userId){
    return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
  }
  try{

    const { channelId , memberId } = req.params
     if( !channelId || typeof channelId !== "string"){
          return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid chat channel");
     }
    if( !memberId || typeof memberId !== "string"){
        return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid member");
    }
    const channel = await db.orm.public.ChatChannel.where({
        id: channelId
     }).first();
    if(!channel){
        return ErrorRes( res , 404 , "CHANNEL_NOT_FOUND" , "channel not found");
     }

    const Usermember = await Channelmember(channelId , userId);

    if(!Usermember.isMember){
        return ErrorRes(res , 400 , "INVALID_MEMBER" , "user is not member of the channel");
    }
  
    if(Usermember.member.role !== "Owner"){
        return ErrorRes( res , 400 , "UNAUTHORIZED" , "user has no ownership to transfer it")
    }
   const isMemberOfchannel = await Channelmember(channelId , userId);
    if(!isMemberOfchannel.isMember){
        return ErrorRes(res , 400 , "INVALID_MEMBER" , "user is not member of the channel");
    }
  
    if(channel.type === "PRIVATE" && isMemberOfchannel.member.membership.role !== "ADMIN"){
        return ErrorRes(res , 400 , "INVALID_REQUEST" , "ownership of private channels can be transfer to other admin only");
    }

    const result = await db.transaction(async (tx) =>{

        const removeOld = await tx.orm.public.ChannelMember.where({
            memberId: userId,
            channelId: channelId
        }).update({
            role: "MEMBER"
        })

        const NewOwner = await tx.orm.public.ChannelMember.where({
            channelId: channelId,
            memberId: memberId
        }).update({
            role: "OWNER"
        })
        return {
            removeOld,
            NewOwner
        }
    })


      res.status(200).json({
        succeess: true ,
        status: 200,
        message: "Ownership transfer successfully",
        data: result
      })
      return

  }catch(err){
        console.log(" Ownership transfer error -> " + err)
        ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "Ownership transfer fail because of the internal sever error.")
        return;
  }
}

export {TransferOwnership}

