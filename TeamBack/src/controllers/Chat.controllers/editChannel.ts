import {type Request , type Response , type NextFunction} from "express"
import { db } from "../../prisma/db"

async function Channelmember(channelId: string , userId : string) : Promise<any>{

    const channelmember = await db.orm.public.ChannelMember.where({
       channelId: channelId,
       memberId: userId
     }).first();

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

const editChannel = async(req: Request<{channelId: string }> , res: Response): Promise<void> => {

 const userId = req.userId;
  if(!userId){
    return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
  }
  try{

    const { channelId } = req.params
     if( !channelId || typeof channelId !== "string"){
          return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid chat channel");
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
  
        let {name , description , isDefault , type} = req.body;

    if(!name && !description){
        return ErrorRes(res , 400 , "BAD_INPUT" , "please enter valid input")
    }
    if(!name) name = channel.name;
    if( !name || typeof name !== "string" || !name.toLowerCase().trim()){
        return ErrorRes( res , 400 , "INVALID_NAME" , "Please enter a valid name");
    }
    if( name.length > 50 || name.length < 5){
       return ErrorRes( res , 400 , "INVALID_NAME" , "name should be between 2-50 character");
    }
    if(!description) description = channel.name;
    if( description && (typeof description !== "string")){
      return ErrorRes( res , 400 , "INVALID_INPUT" , "please enter valid description");
    } 

    if( isDefault && type === "PRIVATE"){
        return ErrorRes(res , 400 , "BAD INPUT" , "Default channels cannot be private")
    }
    if( type && (type !== "PRIVATE" || type !== "PUBLIC")){
        return ErrorRes(res , 400 , "BAD_INPUT", "type of channel can be either PRIVATE or PUBLIC")
    }

    if(!isDefault) isDefault = channel.isDefault
    if(!type) type = channel.type

    const updateChannel =await db.orm.public.ChatChannel.where({
        id: channelId
    }).update({
        name: name,
        description: description,
        isDefault: true,
        type : type
    })
      res.status(200).json({
        succeess: true ,
        status: 200,
        message: "Channel updated successfully",
        data: updateChannel
      })
      return

  }catch(err){
        console.log(" chat channel update error -> " + err)
        ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "channel update fail because of the internal sever error.")
        return;
  }
}

export {editChannel}

