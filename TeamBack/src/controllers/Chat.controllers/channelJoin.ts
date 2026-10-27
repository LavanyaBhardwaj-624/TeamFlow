import { type Response , type Request } from "express"
import { db } from "../../prisma/db.ts"
import { Temporal } from "@js-temporal/polyfill";

// for public channels directly join
// dent request for public channels

// -> channel id , userId 

const STATUS_VAR = ["PENDING" , "APPROVED" , "DECLINED"]
async function wsmember(wsId: string , userId : string) : Promise<any>{

    const wsmember = await db.orm.public.WorkspaceMember.where({
        workspaceId: wsId,
        userId: userId
     }).include("user");
     return {
         isMember: !!wsmember,
         member: wsmember
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

const Joinpublic = async function(req: Request<{ channelId : string}> , res: Response) : Promise<void>{

    const userId = req.userId
    if(!userId) {
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
     if(channel.type !== "PUBLIC"){
        console.log(" Wrong api call , api call should be of Private channel");
        return ErrorRes( res , 400 , "  INVALID_CHANNEL" , "requested channel is private and only can be join through a request.");
     }

     const workspaceId = channel.workspaceId;
 
     const member = await wsmember(workspaceId , userId);
     if(!member.isMember){
        return ErrorRes( res , 403 , "UNAUTHORIZED" , "Only workspace members can join Public chats");
     }
     const isjoined = await db.orm.public.ChannelMember.where({
       channelId: channelId,
       memberId: userId,
     }).first();

     if(isjoined){
      return ErrorRes( res , 409 , "ALREADY_MEMBER" ,"user is already a member");
     }

     const joining = await db.orm.public.ChannelMember.create({
        workspaceId: workspaceId,
        channelId: channelId,
        memberId: userId,
        role: "MEMBER"
     })

     res.status(201).json({
        success: true,
        status: 201,
        message: "User successfully joined the channel",
        data: joining
     })
     return;
    }catch(err){
        console.log("Public channel Joining error -> " + err);
        return ErrorRes( res , 500 , "INTERNAL_SERVER_ERROR" , "channel joining fail due to internal server error");
    }
}

export { Joinpublic }

const Joinprivate = async function( req: Request<{channelId: string}> , res: Response): Promise<void> {

       const userId = req.userId
    if(!userId) {
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
     if(channel.type !== "PRIVATE"){
        console.log(" Wrong api call , api call should be of public channel");
        return ErrorRes( res , 400 , "  INVALID_CHANNEL" , "requested channel is public. can be join directly.");
     }

     const workspaceId = channel.workspaceId;
 
     const member = await wsmember(workspaceId , userId);
     if(!member.isMember){
        return ErrorRes( res , 403 , "UNAUTHORIZED" , "Only workspace members can join Public chats");
     }

   const isjoined = await db.orm.public.ChannelMember.where({
       channelId: channelId,
       memberId: userId,
     }).first();

     if(isjoined){
      return ErrorRes( res , 400 , "ALREADY_MEMBER" ,"user is already a member");
     }

     const request_already = await db.orm.public.JoinRequest.where({
         channelId: channelId,
         senderId: userId,
         status:"PENDING",
     }).first()

    if(request_already){
      return ErrorRes( res , 409 , "REQUESTED" ,"an request is already made by the user is pending");
     }

      const request = await db.orm.public.JoinRequest.create({
        channelId: channel.id,
        status: "PENDING",
        senderId: userId
      })

      res.status(201).json({
        succeess: true ,
        status: 201,
        message: "Join request is successfully send",
        data: request
      })
      return;
    }catch(err){
        console.log(" Join Private error -> " + err)
        ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "request is not send becaus of the internal sever error.")
        return;
    }
}

export { Joinprivate };


const respondToJoin = async (req: Request<{requestId: string}> , res:Response): Promise<void> => {


    const userId = req.userId
    if(!userId) {
       return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
    }
    try{
    const status = req.body.status;
    if( !status || typeof status !== "string" || !( STATUS_VAR.includes(status))){
         return ErrorRes( res , 401 , "invalide response", "invalid response.")
    }
    const { requestId } = req.params;
    if(!requestId || typeof requestId !== "string"){
          return ErrorRes( res , 400 , "INVALID_REQUEST_ID" , "invalid request");
    }

    const request = await db.orm.public.JoinRequest.where({
        id: requestId,
        status: "PENDING"
    }).first();

    if(!request){
        return ErrorRes( res , 404 , "REQUEST_NOT_FOUND" , "request not found");
    }

    const user = await db.orm.public.ChannelMember.where({
         channelId: request.channelId,
         memberId: userId,
    }).first();

    if(!user || user.role !== "OWNER"){
      return ErrorRes(res , 403 , "UNAUTHORIZED", "User is not authorized to respond on this request");
    }

    const result = await db.transaction(async (tx) => {

      let updateRequest;
      if( status === "APPROVED"){
      updateRequest = await tx.orm.public.JoinRequest.where({
         id: requestId,
      }).include("channel").update({
         status: "APPROVED",
         responseBy: userId,
         responseAt: Temporal.Instant.from(new Date().toISOString()),
      })

      const addmember = await tx.orm.public.ChannelMember.create({
         memberId: updateRequest?.senderId,
         workspaceId: updateRequest?.channel?.workspaceId,
         role: "MEMBER",
         channelId: updateRequest?.channelId
      })

     }else{
      updateRequest = await tx.orm.public.JoinRequest.where({
         id: requestId,
      }).update({
         status: "DECLINED",
         responseBy: userId,
         responseAt: Temporal.Instant.from(new Date().toISOString()),
      })

     }
     return updateRequest;
    })

    res.status(200).json({
        success: true,
        status: 200,
        message: "user added to chat channel successfully",
        data: result,
      })
      return;
   }catch(err){
      console.log(" Respond to Request error -> " + err)
      ErrorRes( res , 500 , "INTERNA_SERVER_ERROR" , " reponse fail due to internal server error")
      return;
    }
}

export { respondToJoin };

// Add someone directly
const AddDirectly = async function( req: Request<{channelId: string}> , res: Response): Promise<void> {

      const userId = req.userId
    if(!userId) {
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
     
     const User2add = req.body.User2add;

     if(!User2add || typeof User2add !== "string"){
      return ErrorRes(res , 404 , "INVALID_USER" , "user is invalid");
     }

     const is_User_Member = await db.orm.public.ChannelMember.where({
         channelId: channelId,
         memberId: userId
     }).first();
     if( !is_User_Member){
        return ErrorRes(res , 400 , "Unauthorized" , " User is not allowed to add others")
     }
     const isWsMember = await wsmember(channel.workspaceId , User2add);
     if( !isWsMember.isMember){
         return ErrorRes(res , 400 , "Unauthorized" , " User cannot be added , Invalid Workspace memebr");
     }

     if( channel.type === "PRIVATE" && is_User_Member.role !== "OWNER"){
       return ErrorRes(res , 400 , "Unauthorized" , " User is not allowed to add others")
     }
   // public -> koi bhi add kar sakta hai
   // private -> only owner/admin 

   const isjoined = await db.orm.public.ChannelMember.where({
       channelId: channelId,
       memberId: User2add,
     }).first();

     if(isjoined){
      return ErrorRes( res , 400 , "ALREADY_MEMBER" ,"user is already a member");
     }

      const addmember = await db.orm.public.ChannelMember.create({
           channelId: channelId,
           workspaceId: channel.workspaceId,
           memberId: User2add,
           role: "MEMBER"
      })

      res.status(201).json({
        succeess: true ,
        status: 201,
        message: "memebr is joined successfully",
        data: addmember
      })
      return;
    }catch(err){
        console.log(" Direct Add error -> " + err)
        ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "Member can't be added because of the internal sever error.")
        return;
    }
}
export {AddDirectly};
