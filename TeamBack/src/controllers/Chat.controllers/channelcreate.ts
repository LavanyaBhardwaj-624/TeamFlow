
import {type Request , type Response , type NextFunction} from "express"
import { db } from "../../prisma/db.ts"
import { emitWorkspaceEvent } from "../../realtime/socket.ts"



async function wsmember(wsId: any , userId : any) : Promise<any>{

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

const creatchannel = async function ( req: Request<{workspaceId: string}> , res: Response) :Promise<void>{

    const userId = req.userId;
    if(!userId) {
       return ErrorRes( res , 401 , "AUTHORIZATION_FAIL" , "authorization failed");
    }
    try{
    const { workspaceId } = req.params
    if( !workspaceId || typeof workspaceId !== "string"){
         return ErrorRes( res , 400 , "INVALID_WORKSPACE" , " Workspace is invalid");
    }
    const {isMember , member} = await wsmember( workspaceId , userId);

    if(!isMember){
        return ErrorRes( res , 400 , "Authorization_FAIL" , "user is not authorized to create channel");
    }

    const { type , name, description } = req.body;

    if(type && ( type === "PRIVATE" && member.role === "MEMBER")){
          return ErrorRes( res , 403 , "Unauthorized" , "only admins can create private channels");
    }

    if( !name || typeof name !== "string" || !name.toLowerCase().trim()){
        return ErrorRes( res , 400 , "INVALID_NAME" , "Please enter a valid name");
    }
    if( name.length > 50 || name.length < 5){
       return ErrorRes( res , 400 , "INVALID_NAME" , "name should be between 2-50 character");
    }

    if( description && (typeof description !== "string")){
      return ErrorRes( res , 400 , "INVALID_INPUT" , "please enter valid description");
    } 

    if( description.length > 1000){
        return ErrorRes( res , 400 , "INVALID_INPUT" , "description charactor shouldn't be excced more than 500 character");
    }

    const checkunique = await db.orm.public.ChatChannel.where({
        workspaceId: workspaceId,
        name: name.toLowerCase().trim()
    }).first()

    if(checkunique){
        return ErrorRes( res ,400 , "INVALID_INPUT" , " a channel with this name already exist in this workpsace")
    }

    const result = await db.transaction( async (tx) => {

        const channel = await tx.orm.public.ChatChannel.create({
            workspaceId: workspaceId,
            createdBy: userId,
            name : name.toLowerCase().trim(),
            description: description,
            isDefault : name === "general",
            type : type === "PRIVATE" ? "PRIVATE" : "PUBLIC",
        })

        const member = await tx.orm.public.ChannelMember.create({
            channelId: channel.id,
            workspaceId: workspaceId,
            memberId: userId,
            role: "OWNER",
        })

        return channel
    })
    emitWorkspaceEvent(workspaceId, "channel:created", {
      id: result.id, name: result.name, type: result.type, description: result.description,
    });

    res.status(201).json({
        success: true,    
         status: 201,
         message: " Channel created successfully",
         data: result
    })
   }catch(err){
        console.log(" Create channel -> " + err);
        return ErrorRes( res , 500 , "SERVER_ERROR" , " channel creation failed due to internel server error");
}
}


export default creatchannel;
