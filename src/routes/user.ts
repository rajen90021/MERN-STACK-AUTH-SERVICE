import express, {
  NextFunction,
  Request as ExpressRequest,
  RequestHandler,
  Response,
} from 'express'

import { AuthRequest, CreateUserRequest, UpdateUserRequest } from '../types'
const authRouter = express.Router()
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { roles } from '../constants'
import { UserService } from '../services/UserService'
import { UserController } from '../controllers/UserController'
import { User } from '../entity/User'
import listUsersValidator from '../validators/list-users-validator'

const userRepository = AppDataSource.getRepository(User)
const loggerInstance = logger
const userService = new UserService(userRepository, loggerInstance)
const userController = new UserController(userService, loggerInstance)

authRouter.post(
  '/',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: ExpressRequest, res: Response, next: NextFunction) =>
    userController.create(req as CreateUserRequest, res, next),
)

authRouter.get(
  '/',
  authenticate,
  canAccess([roles.ADMIN]),
  listUsersValidator,
  (req: ExpressRequest, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next),
)

authRouter.get(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),

  (req: ExpressRequest, res: Response, next: NextFunction) =>
    userController.getUserById(req as AuthRequest, res, next),
)

authRouter.patch(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: UpdateUserRequest, res: Response, next: NextFunction) =>
    userController.update(req, res, next) as unknown as RequestHandler,
)

authRouter.delete(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: ExpressRequest, res: Response, next: NextFunction) =>
    userController.destroy(req as CreateUserRequest, res, next),
)

export default authRouter
