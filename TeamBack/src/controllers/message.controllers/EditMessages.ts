import {type NextFunction, type Request , type Response} from 'express'
import { db } from '../../prisma/db.ts';
import { emitChannelEvent } from '../../realtime/socket.ts';

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



const EditMessage = async (req : Request<{channelId: string , messageId: string}> , res: Response) : Promise<void> => {

     const userId = req.userId;
     if(!userId){
       return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
     }

     try{
        
        const { channelId , messageId } = req.params;

         if( !channelId || typeof channelId !== "string"){
            return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid chat channel");
        }
        if( !messageId || typeof messageId !== "string"){
            return ErrorRes(res, 400 , "INVALID_CHANNEL" , "invalid chat channel");
        }
        const Editmessage = req.body.message;
        if( !Editmessage?.trim() ||  typeof EditMessage !== "string"){
            return ErrorRes( res , 400 , "BAD_INPUT" , " please input valid message");
        }

        const member = await Channelmember(channelId , userId);

        if(!member.isMember){
            return ErrorRes(res , 400 , "INVALID_MEMBER" , "user is not member of the channel");
        }

        const isMessage = await db.orm.public.Message.where({
            id: messageId,
            senderId: userId,
        }).first();

        if(!isMessage){
           return ErrorRes(res , 404 ,"MESSAGE_NOT_FOUND" , "contnet not found")
        }
       
        const edit = await db.orm.public.Message.where({
            id: messageId,
            senderId: userId,
        }).update({
            content: EditMessage,
        });
        emitChannelEvent(channelId, 'message:edited', edit);

        res.status(201).json({
            success: true,
            status: 201,
            message:" message edit successfully",
            data: edit
        })
        return;

     }catch(err){

        console.log("Edit message error -> " + err)
        return ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "edit message fail due to internal server error");
     }

}
export {EditMessage}
