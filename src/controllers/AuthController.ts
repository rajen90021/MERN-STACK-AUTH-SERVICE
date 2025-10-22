import { NextFunction, Response } from 'express'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body
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
