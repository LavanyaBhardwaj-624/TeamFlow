
import {type Request , type Response , type NextFunction} from "express"
import { db } from "../../prisma/db.ts"
import { and } from "@prisma/orm-postgres/orm-client";


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

const is_wsmember = async function (userId: string , wsId : string) {

  const member = await db.orm.public.WorkspaceMember.where({
    workspaceId: wsId,
    userId: userId
  }).first();
  return{
      isMember: !!member,
      member: member
  }
}

const ListChannel = async function(req: Request<{ workspaceId: string}>, res: Response): Promise<void> {

  const userId = req.userId;
  if(!userId){
    return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
  }
   try{

    const { workspaceId } = req.params
    if( !workspaceId || typeof workspaceId !== "string"){
         return ErrorRes( res , 400 , "INVALID_WORKSPACE" , " Workspace is invalid");
    }

    const workspacemember = await is_wsmember(userId , workspaceId);

    if(!workspacemember.isMember){
      return ErrorRes(res , 401 , "UNAUTHORIZED"  , "user do not have authority to see list of channel of this workspace.")
    }
     
    const channels = await db.orm.public.ChatChannel.where({
      workspaceId: workspaceId
    }).include("members", (members) =>
        members.where((m) => m.memberId.eq(userId))
    ).all();;

    const access = channels.map((c) =>{
      const isjoined = c.members.length > 0;
      const visible = c.type === "PUBLIC" || isjoined;
      return{
        channel :{
          id: c.id,
          name: c.name,
          desciption:  visible ? c.description : null,
          isDefault : c.isDefault,
          type: c.type,
          joined: isjoined,
        }
      }
    })

      res.status(200).json({
        success: true,
        status: 200,
        message: "Chat channels retrieve successfully",
        data: access,
      })
      return;
   }catch(err){
      console.log(" List channel error -> " + err)
      ErrorRes( res , 500 , "INTERNA_SERVER_ERROR" , " chat channel retrieve fail due to internal server error")
      return;
    }
  }

  export  { ListChannel }


// channelId in params
// only member of channel get the member list
const GetMember = async (req: Request<{ channelId: string}> , res: Response) : Promise<void> => {
  
  
  const userId = req.userId;
  if(!userId){
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
            return ErrorRes(res , 400 , "UNAUTHORIZED" , "Not authorized")
        }

        const memberList = await db.orm.public.ChannelMember.where({
          channelId: channelId,
        }).orderBy((i) => i.joinedAt.asc()).all()
    
        
      res.status(200).json({
        succeess: true ,
        status: 200,
        message: "memebr list retreive successfully",
        data: memberList
      })
      return;
  } catch(err){
  
        console.log(" chat member list error -> " + err)
        ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "Member List retrive fail because of the internal sever error.")
        return;

  }

}

export {GetMember}

// only to creator of channel , and channel must be PRIVATE , means creator === Admin

const GetJoinRequest = async(req: Request , res: Response): Promise<void> => {

  const userId = req.userId;
  if(!userId){
    return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
  }

  try{

    // get all join request which are pending of all channel in which user is Owner and channel is private
    const channels = await db.orm.public.ChatChannel.
    where({ type: "PRIVATE" })
    .where((c) =>
      c.members.some((m) => and(m.memberId.eq(userId), m.role.eq("OWNER")))
    )
    .where((c) => c.joinRequests.some((r) => r.status.eq("PENDING"))).include("workspace") // drop channels with no pending requests
    .include("joinRequests", (jr) => jr.where({ status: "PENDING" }).include("sender"))
    .all();

  //  const pendingRequests = channels.flatMap((c) => c.joinRequests);

   const modifyrequest = channels.map((c) => {
    return {
      channelName: c.name,
      workspaceName: c.workspace.name,
      workspaceSlug : c.workspace.slug,
      pendingRequests:{
        ...c.joinRequests   // with sender and it is an array as joinrequest for a channel can be many
      },
    }
   })

           
    res.status(200).json({
      succeess: true ,
      status: 200,
      message: "join request retrieve list retreive successfully",
      data: modifyrequest
    })
      return;

  }catch(err){
  
        console.log(" join reques list error -> " + err)
        ErrorRes(res , 500 , "INTERNAL_SERVER_ERROR" , "Join Request List retrive fail because of the internal sever error.")
        return;
  }
}

export {GetJoinRequest} 