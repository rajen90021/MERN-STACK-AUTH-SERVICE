import { NextFunction, Request, Response } from 'express'
import { AuthRequest, RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import createHttpError from 'http-errors'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'

import { TokenService } from '../services/tokenService'
import { CredentialService } from '../services/CredentialService'
import { roles } from '../constants'
import { Config } from '../config'

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
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
        role: roles.CUSTOMER,
      })
      this.logger.info(`User ${user.id} registered successfully`)

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
        // add tenant id to the payload
        tenant: user.tenant ? String(user.tenant.id) : '',

        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      // persist the refresh token in database or in-memory store like redis

      const newRefeshToken = await this.tokenService.persistRefreshToken(user)

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefeshToken.id,
      })

      res.cookie('accessToken', accessToken, {
        domain: Config.MAIN_DOMAIN,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1hr
      })
      res.cookie('refreshToken', refreshToken, {
        domain:Config.MAIN_DOMAIN,
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

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation errors:', result.array())
      return res.status(400).json({ errors: result.array() })
    }

    const { email, password } = req.body

    if (!email || !password) {
      this.logger.error('Missing required fields')
      const err = createHttpError(400, 'Missing required fields')
      next(err)
      return
    }

    this.logger.debug(`Logging in user with email ${email}`)

    // check if user exists in db
    // compare password
    // add token to cookie
    // retrun the response
    try {
      const user = await this.userService.findbyEmailWithPassword(email)

      if (!user) {
        const err = createHttpError(400, 'Email or password does not match')
        next(err)
        return
      }

      const isPasswordValid = await this.credentialService.comparePassword(
        password,
        user.password,
      )

      if (!isPasswordValid) {
        const err = createHttpError(400, 'Email or password does not match')
        next(err)
        return
      }
      
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
        tenant: user.tenant ? String(user.tenant.id) : '',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      // persist the refresh token in database or in-memory store like redis

      const newRefeshToken = await this.tokenService.persistRefreshToken(user)

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefeshToken.id,
      })

      res.cookie('accessToken', accessToken, {
        domain: Config.MAIN_DOMAIN,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1hr
      })
      res.cookie('refreshToken', refreshToken, {
        domain: Config.MAIN_DOMAIN,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
      this.logger.info(`User ${user.id} logged in successfully`)
      res.status(200).json({
        id: user.id,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
      })
    } catch (error) {
      next(error)
      return
    }
  }

  async self(req: AuthRequest, res: Response) {
    this.logger.error(`Fetching user ${req.auth.sub}`)
    try {
      const user = await this.userService.findById(Number(req.auth.sub))
      return res.json({ ...user, password: undefined })
    } catch (error) {
      console.log('Error fetching user:', error)
      this.logger.error('Error fetching user:', error)

      return
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    console.log('testi', (req as AuthRequest).auth)

    const payload: JwtPayload = {
      sub: (req as AuthRequest).auth.sub,
      role: (req as AuthRequest).auth.role,
      tenant: (req as AuthRequest).auth.tenant,
      firstName: (req as AuthRequest).auth.firstName,
      lastName: (req as AuthRequest).auth.lastName,
      email: (req as AuthRequest).auth.email,
    }

    try {
      const accessToken = this.tokenService.generateAccessToken(payload)

      const user = await this.userService.findById(
        Number((req as AuthRequest).auth.sub),
      )

      if (!user) {
        const err = createHttpError(401, 'User with the token could not find')
        next(err)
        return
      }
      // persist the refresh token in database or in-memory store like redis

      const newRefeshToken = await this.tokenService.persistRefreshToken(user)

      // delete old refresh token
      await this.tokenService.deleteRefreshToken(
        Number((req as AuthRequest).auth.id),
      )

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefeshToken.id,
      })

      res.cookie('accessToken', accessToken, {
        domain:Config.MAIN_DOMAIN,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1hr
      })
      res.cookie('refreshToken', refreshToken, {
        domain: Config.MAIN_DOMAIN,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
      this.logger.info(`User ${user.id} logged in successfully`)
      res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      })
    } catch (e) {
      this.logger.error(e)
      next(e)
      return
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log('req.auth:', req.auth)
      await this.tokenService.deleteRefreshToken(Number(req.auth.id))
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      res.status(200).json({ message: 'Logged out successfully' })
    } catch (e) {
      this.logger.error(e)
      next(e)
      return
    }
  }
}
