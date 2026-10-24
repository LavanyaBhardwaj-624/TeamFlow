import {type Request , type Response} from 'express'
import { db } from '../prisma/db.ts'
import { verifyPassword } from '../utility/PassHass.ts'
import { setRefreshCookie , signAccessToken , issueRefreshToken} from '../utility/tokens.ts'
import dotenv from 'dotenv'
dotenv.config();
const Login = async function(req : Request , res: Response): Promise<void> {


    const body : any = req.body;

    const {email , password } = body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
            success: false , 
            error:{
            code: "AUTHENTICATION FAILED",
            message: 'Invalid Credential',
            status: 400,
            }
        });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({            
            success: false , 
            error:{
            code: "AUTHENTICATION FAILED",
            message: 'Invalid Credential',
            status: 400,
            }});
      return;
    }
  try{
   const user = await db.orm.public.User.where({ email: email }).first();
    if(!user){
      res.status(401).json({
             success: false , 
            error:{
            code: "AUTHENTICATION FAILED",
            message: 'Invalid Credential',
            status: 401,
            }});
      return;
    }

    const verifyPass = await verifyPassword( user.passwordHash , password );

    if(!verifyPass){
        res.status(401).send({
             success: false , 
            error:{
            code: "AUTHENTICATION FAILED",
            message: 'Invalid Credential',
            status: 401,
            }
        });
        return;
    }

    const accesstoken = await signAccessToken(user.id);

    const refreshtoken = await issueRefreshToken(user.id);
    

    
    // Return sanitized response (never return passwordHash)
     setRefreshCookie( res , refreshtoken )
     res.status(201).json({
      success: true,
      status: 201,
      message: 'User Logged In successfully',
      data: {
        user:{
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        title: user.title,
        description: user.description,
        image: user.imageUrl
        },
        accesstoken: accesstoken,
      },
    });

  }catch(err: any){
      console.log(`Login Page error -> ` + err)
             res.status(500).json({
              success: false , 
              error:{
              code: " SERVER_ERR",
              message: "server error",
              status: 500,
             }
            });            
          
  }
}

export default Login