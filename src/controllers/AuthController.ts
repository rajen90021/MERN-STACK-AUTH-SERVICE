import { NextFunction, Response } from 'express'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import createHttpError from 'http-errors'
import { validationResult } from 'express-validator'

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {


      const result = validationResult(req)
      if (!result.isEmpty()) {
        this.logger.error('Validation errors:', result.array())
      return  res.status(400).json({ errors: result.array() })
      }



    const { firstName, lastName, email, password } = req.body

      if (!firstName || !lastName || !email || !password) {
        this.logger.error('Missing required fields')
       const err= createHttpError(400, 'Missing required fields')
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
      res.status(201).json({ id: user.id, firstName, lastName, email })
    } catch (error) {
      next(error)
      return
    }
  }
}
