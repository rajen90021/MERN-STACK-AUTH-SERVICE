import express, { NextFunction, Request, Response } from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import registerValidator from '../validators/register-validator'
import { TokenService } from '../services/tokenService'
import { RefreshToken } from '../entity/RefreshToken'
import loginValidator from '../validators/login-validator'
import { CredentialService } from '../services/CredentialService'
import authenticate from '../middlewares/authenticate'
import { AuthRequest } from '../types'
import validateRefreshToken from '../middlewares/validateRefreshToken'
import parseRefreshToken from '../middlewares/parseRefreshToken'

const authRouter = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository, logger)
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
const tokenService = new TokenService(refreshTokenRepository)
const credentialService = new CredentialService()
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService,
)

authRouter.post(
  '/register',
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
)

authRouter.post(
  '/login',
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
)

authRouter.get('/self', authenticate, (req: Request, res: Response) =>
  authController.self(req as AuthRequest, res),
)

authRouter.post(
  '/refresh',
  validateRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next),
)

authRouter.post(
  '/logout',
  authenticate,
  parseRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as AuthRequest, res, next),
)

export default authRouter
// testing route ee