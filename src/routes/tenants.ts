import express, { NextFunction, Request, Response } from 'express'
import { AuthRequest } from '../types'
import { TenantController } from '../controllers/TenantController'

const authRouter = express.Router()

import { TenantService } from '../services/TenantService'
import { AppDataSource } from '../config/data-source'
import { Tenant } from '../entity/Tenants'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { roles } from '../constants'
import tenantValidator from '../validators/tenant-validator'

const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService, logger)

authRouter.post(
  '/',
  tenantValidator,
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req as AuthRequest, res, next),
)

authRouter.get(
  '/list',

  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getListTenant(req as AuthRequest, res, next),
)
authRouter.get(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getSingleTenantById(req as AuthRequest, res, next),
)
authRouter.post(
  '/update/:id',
  tenantValidator,
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.updateTenant(req as AuthRequest, res, next),
)
authRouter.delete(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.deleteTenant(req as AuthRequest, res, next),
)

export default authRouter
