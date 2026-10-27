import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db.ts';

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

const postMessage = async (req : Request<{channelId: string}> , res: Response) : Promise<void> => {

     const userId = req.userId;
     if(!userId){
       return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
     }

     try{
        
        const { channelId } = req.params;
   
        if( !channelId || typeof channelId !== "string"){
            return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid chat channel");
        }

        // check if user is a member of channel

        const member = await Channelmember(channelId , userId);

        if(!member.isMember){
            return ErrorRes(res , 400 , "INVALID_MEMBER" , "user is not member of the channel");
        }

        const message = req.body.message;
        if( !message.trim()){
            return ErrorRes( res , 400 , "BAD_INPUT" , " please input valid message");
        }

        const Addmessage = await db.orm.public.Message.create({
            channelId: channelId,
            senderId: userId,
            content: message,
        })

        res.status(201).json({
            success: true,
            status: 201,
            message:" message sent successfully",
            data: Addmessage
        })
        return;

     }catch(err){

        console.log("Post message error -> " + err)
        return ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "message is not send due to internal server error");
     }

}
export {postMessage}