
import { Request , Response , NextFunction } from 'express'
import jwt, {JwtPayload} from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

import { setRefreshCookie , rotateRefreshToken} from '../utility/tokens'

declare global {
namespace Express {
  interface Request{
      userId? : String
  }
}
}


export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 1. Try the access token
  const accessToken = req.headers.authorization?.split(' ')[1]
 
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_KEY as string) as JwtPayload
      req.userId = decoded.Id as string
      return next()
    } catch {
      // expired / invalid -> fall through to refresh token
    }
  }
 
  // 2. Fall back to the refresh token (cookie)
  const refreshToken: string | undefined = req.cookies?.refreshToken
  if (!refreshToken) {
    res.status(401).json({ message: 'Authentication failed' })
    return
  }
 
  try {
    // verifies signature, checks Redis, rotates the refresh token
    const { userId, accessToken: newAccess, refreshToken: newRefresh } = await rotateRefreshToken(refreshToken)
 
    setRefreshCookie(res, newRefresh)
    res.setHeader('x-access-token', newAccess) // client should store & use this
    req.userId = userId
    return next()
  } catch {
    res.clearCookie('refreshToken')
    res.status(401).json({ message: 'Authentication failed' })
  }
}
 