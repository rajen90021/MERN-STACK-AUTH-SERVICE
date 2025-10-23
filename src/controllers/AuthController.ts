import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import createHttpError from 'http-errors'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'

import { TokenService } from '../services/tokenService'

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation errors:', result.array())
      return res.status(400).json({ errors: result.array() })
    }

    const { firstName, lastName, email, password } = req.body

    if (!firstName || !lastName || !email || !password) {
      this.logger.error('Missing required fields')
      const err = createHttpError(400, 'Missing required fields')
      next(err)
      return
    }

    this.logger.debug(
      `Registering user ${firstName} ${lastName} with email ${email}`,
    )
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      })
      this.logger.info(`User ${user.id} registered successfully`)

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      // persist the refresh token in database or in-memory store like redis

      const newRefeshToken = await this.tokenService.persistRefreshToken(user)

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefeshToken.id,
      })

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1hr
      })
      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })

      res.status(201).json({ id: user.id, firstName, lastName, email })
    } catch (error) {
      next(error)
      return
    }
  }
}
