import { Request, Response } from 'express';
import { db } from '../prisma/db';
import { hashPassword } from '../utility/PassHass';
import { setRefreshCookie , signAccessToken , issueRefreshToken} from '../utility/tokens'

import dotenv from 'dotenv'
dotenv.config()
/**
 * Controller to handle user registration
 * Model: User (email, name, passwordHash)
 */
const Signup = async function (req: Request, res: Response): Promise<void> {
  try {
    const { email, name, password } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
            success: false , 
            error:{
            code: "BAD INPUT",
            message: 'Invalid Email',
            status: 400,
            }
        });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
            success: false , 
            error:{
            code: "BAD INPUT",
            message: 'Invalid Password',
            status: 400,
            }});
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