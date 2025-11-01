import { JwtPayload, sign } from 'jsonwebtoken'
import createHttpError from 'http-errors'

import { User } from '../entity/User'
import { RefreshToken } from '../entity/RefreshToken'
import { Repository } from 'typeorm'
import { Config } from './../config/index'

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload): string {
    let privateKey: string

    if (!Config.PRIVATE_KEY) {
      throw createHttpError(500, 'secret key not found')
    }
    try {
      privateKey = Config.PRIVATE_KEY
    } catch (err) {
      console.error('Error reading private key:', err)
      throw createHttpError(500, 'Internal server error')
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'auth-service',
    })

    return accessToken
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: '7d',
      issuer: 'auth-service',
      jwtid: String(payload.id),
    })
    return refreshToken
  }

  async persistRefreshToken(user: User) {
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })
    return newRefreshToken
  }

  async deleteRefreshToken(id: number) {
    return await this.refreshTokenRepository.delete({ id: id })
  }
}
