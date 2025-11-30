import { NextFunction, Response, Request as ExpressRequest } from 'express'
import { UserService } from '../services/UserService'

import { Logger } from 'winston'
import { CreateUserRequest, UpdateUserRequest, UserQueryParams } from '../types'
import { matchedData, validationResult } from 'express-validator'

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

    console.log('tenant id form controller ', tenantId)
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

  async getAll(req: ExpressRequest, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true })

    try {
      const [users, count] = await this.userService.getAll(
        validatedQuery as UserQueryParams,
      )

      this.logger.info('All users have been fetched')
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: users,
      })
    } catch (err) {
      next(err)
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

  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    // In our project: We are not allowing user to change the email id since it is used as username
    // In our project: We are not allowing admin user to change others password

    // Validation
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
    }

    const { firstName, lastName, role, email, tenantId } = req.body
    const userId = req.params.id

    if (isNaN(Number(userId))) {
      return
    }

    this.logger.debug('Request for updating a user', req.body)

    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
        email,
        tenantId,
      })

      this.logger.info('User has been updated', { id: userId })

      res.json({ id: Number(userId) })
    } catch (err) {
      next(err)
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
