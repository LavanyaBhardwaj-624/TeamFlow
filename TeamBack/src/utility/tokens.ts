import jwt, { JwtPayload } from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { Response } from 'express'
import redis from '.././config/redis'
import dotenv from 'dotenv'
dotenv.config()

const ACCESS_KEY = process.env.Access_Key as string
const REFRESH_KEY = process.env.Refresh_Key as string

const ACCESS_TTL = '15m'
export const REFRESH_TTL_SEC = 7 * 24 * 60 * 60 // 7 Days

export const refreshKey = (userId: string, jti: string) => `refresh:${userId}:${jti}`

export const signAccessToken = (userId: string) =>
  jwt.sign({ Id: userId }, ACCESS_KEY, { expiresIn: ACCESS_TTL })

export const issueRefreshToken = async (userId: string) => {
  const jti = randomUUID()
  const token = jwt.sign({ Id: userId, jti }, REFRESH_KEY, { expiresIn: REFRESH_TTL_SEC })
  await redis.set(refreshKey(userId, jti), '1', { EX: REFRESH_TTL_SEC })
  return token
}
 
export const revokeAllForUser = async (userId: string) => {
  for await (const key of redis.scanIterator({ MATCH: `refresh:${userId}:*`, COUNT: 100 })) {
    await redis.del(key)
  }
}

export const rotateRefreshToken = async (token: string) => {
  const payload = jwt.verify(token, REFRESH_KEY) as JwtPayload // throws if bad/expired
  const userId = payload.Id as string
  const jti = payload.jti as string
 
  
  const removed = await redis.del(refreshKey(userId, jti))
  if (removed === 0) {
    // Valid signature but not in Redis => revoked or already used (possible theft).
    await revokeAllForUser(userId)
    throw new Error('Refresh token reuse or revoked')
  }
 
  return {
    userId,
    accessToken: signAccessToken(userId),
    refreshToken: await issueRefreshToken(userId),
  }
}

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.SSite as 'lax' | 'strict' | 'none' | undefined,
    path: '/',
    maxAge: REFRESH_TTL_SEC * 1000,
  })
}