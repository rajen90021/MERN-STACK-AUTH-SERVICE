import { NextFunction, Response } from 'express'
import { UserService } from '../services/UserService'

import { Logger } from 'winston'
import { AuthRequest, CreateUserRequest } from '../types'
import { validationResult } from 'express-validator'

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation errors:', result.array())
      return res.status(400).json({ errors: result.array() })
    }

    const { firstName, lastName, email, password, tenantId, role } = req.body
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
      })
      res.status(201).json(user)
    } catch (error) {
      next(error)
    }
  }

  async listUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.list()
      res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  }

  async getUserById(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(Number(req.params.id))
      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }

  async updateUserById(
    req: CreateUserRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await this.userService.findById(Number(req.params.id))
      if (!user) {
        throw new Error('User not found')
      }

      const { firstName, lastName, email, password, tenantId, role } = req.body
      await this.userService.update(user, {
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
      })
      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }

  async destroy(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(Number(req.params.id))
      await this.userService.delete(user)
      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      next(error)
    }
  }
}
