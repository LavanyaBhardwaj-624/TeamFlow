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

const DeleteMessage = async (req : Request<{channelId: string , messageId: string}> , res: Response) : Promise<void> => {

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

        const Usermember = await Channelmember(channelId , userId);

        if(!Usermember.isMember){
            return ErrorRes(res , 400 , "INVALID_MEMBER" , "user is not member of the channel");
        }
        const message = await db.orm.public.Message.where({
            id: messageId,
            channelId: channelId,
        }).first();

        if( !message){
              return ErrorRes(res , 404 ,"MESSAGE_NOT_FOUND" , "contnet not found")
        }
        if( message.senderId !== userId && Usermember.member.role !== "OWNER"){
            return ErrorRes( res , 400 , "UNAUTHORIZED" , "user is not authorized to delete this meesage");
        }

        const deleteMessage = await db.orm.public.Message.where({
            id: messageId,
            channelId: channelId,
        }).delete();
        emitChannelEvent(channelId, 'message:deleted', { id: messageId, channelId });
        res.status(201).json({
            success: true,
            status: 201,
            message:" message deleted successfully",
            data: deleteMessage
        })
        return;

     }catch(err){

        console.log("DELETE message error -> " + err)
        return ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "message delete fail due to internal server error");
     }

}
export {DeleteMessage}
