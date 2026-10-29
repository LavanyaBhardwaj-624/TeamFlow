
import {type Request , type Response} from 'express'
import redis from '../config/redis.ts'

import jwt , {type JwtPayload} from 'jsonwebtoken'
const LogOut = async function(req : Request , res: Response): Promise<void> {

    const token: string | undefined = req.cookies?.refreshToken;

   if (token) {
    const payload = jwt.decode(token) as JwtPayload | null // decode only: we just want to delete it
    const userId = payload?.Id || payload?.sub;
    if (userId && payload?.jti) await redis.del(`refresh:${userId}:${payload.jti}`)
   }
   
  res.clearCookie('refreshToken', { path: '/' })
  res.sendStatus(204)
  
}

export default LogOut
