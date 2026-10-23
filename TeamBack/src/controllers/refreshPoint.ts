
import { type Request , type Response , type NextFunction } from 'express'
import { db } from '.././prisma/db.ts'
import dotenv from 'dotenv'
dotenv.config()

import { setRefreshCookie , rotateRefreshToken} from '../utility/tokens.ts'

declare global {
namespace Express {
  interface Request{
      userId? : string
  }
}
}


export const newRefresh = async (req: Request, res: Response): Promise<void> => {
  
  // 2. Fall back to the refresh token (cookie)
  const refreshToken: string | undefined = req.cookies?.refreshToken
  if (!refreshToken) {
    res.status(401).json({ 
            success: false , 
            error:{
            code: "AUTHENTICATION FAILED",
            message: 'Invalid Credential',
            status: 401,
            }
    })
    return
  }
 
  try {
    // verifies signature, checks Redis, rotates the refresh token
    const { userId, accessToken: newAccess, refreshToken: newRefresh } = await rotateRefreshToken(refreshToken)
 
    setRefreshCookie(res, newRefresh)

    const user = await db.orm.public.User.where({ id: userId}).first();
    res.status(200).json({
      success: true,
      status: 201,
      message: 'Authenticate Successful',
      data: {
        user:{
        id: user?.id,
        email: user?.email,
        name: user?.name,
        createdAt: user?.createdAt,
        },
        accesstoken: newAccess
      },
    })
  } catch {
    res.clearCookie('refreshToken')
    res.status(401).json({ 
             success: false , 
            error:{
            code: "AUTHENTICATION FAILED",
            message: 'Invalid Credential',
            status: 401,
            } 
    })
  }
}
 