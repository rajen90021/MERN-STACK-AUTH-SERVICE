import express, { NextFunction, Request, Response } from 'express'
import { AuthRequest, CreateUserRequest } from '../types'
const authRouter = express.Router()
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { roles } from '../constants'
import { UserService } from '../services/UserService'
import { UserController } from '../controllers/UserController'
import { User } from '../entity/User'

const userRepository = AppDataSource.getRepository(User)
const loggerInstance = logger
const userService = new UserService(userRepository, loggerInstance)
const userController = new UserController(userService, loggerInstance)

authRouter.post(
  '/',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req as CreateUserRequest, res, next),
)

authRouter.get(
  '/',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.listUser(req as AuthRequest, res, next),
)

authRouter.get(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.getUserById(req as AuthRequest, res, next),
)

authRouter.patch(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.updateUserById(req as CreateUserRequest, res, next),
)

authRouter.delete(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.destroy(req as CreateUserRequest, res, next),
)

export default authRouter
