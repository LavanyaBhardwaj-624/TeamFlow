import { type Request, type Response } from 'express';
import { db } from '../prisma/db.ts';
import { hashPassword } from '../utility/PassHass.ts';
import { setRefreshCookie , signAccessToken , issueRefreshToken} from '../utility/tokens.ts'

import dotenv from 'dotenv'

dotenv.config()
/**
 * Controller to handle user registration
 * Model: User (email, name, passwordHash)
 */
const fail = (res: Response, status: number, message: string) => {
        res.status(status).json({
            success: false , 
            error:{
            code: "BAD_INPUT",
            message: message,
            status: status,
            }
        });
};
const Signup = async function (req: Request, res: Response): Promise<void> {
  try {
    const { email, name, password, title , description , image } = req.body;

    if (!email || typeof email !== 'string') {
          fail(res , 400 , "Invalid email")
      return;
    }
    if (!name || typeof name !== 'string') {
       fail( res , 400 , "invalid name")
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
       fail(res , 400 , "invalid Pasword");
      return;
    }
    if(!title || typeof title !== "string" || title.length > 100){
      fail(res , 400 , "Invalid title");
      return;
    }
    if(!description || typeof description !== "string" || description.length > 1000){
      fail(res , 400 , "Invalid description");
      return;
    }

    // Check if user already exists
    const existingUser = await db.orm.public.User.first({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
             success: false , 
            error:{
            code: "CONFLICT",
            message: 'USER ALREADY EXIST',
            status: 401,
            }
        });
      return;
    }

    // Hash password with Argon2id
    const passHashed = await hashPassword(password);

    // Create user in database
    const user = await db.orm.public.User.create({
      email: email.toLowerCase(),
      name: name ?? null,
      passwordHash: passHashed,
      title: title,
      imageUrl: image,
      description: description,
    });

    // generate access token:
    const accesstoken = await signAccessToken(user.id);

    const refreshtoken = await issueRefreshToken(user.id);
    
    // Return sanitized response (never return passwordHash)
     setRefreshCookie( res , refreshtoken )

    res.status(201).json({
      success: true,
      status: 201,
      message: 'User Sign Up successfully',
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
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({
            success: false , 
            error:{
            code: "SERVER ERROR",
            message: 'User Inable to register due to Server Error',
            status: 500,
            }
    });
  }
};

export default Signup;
