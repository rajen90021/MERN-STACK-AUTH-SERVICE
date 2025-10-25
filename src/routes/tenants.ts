import express from 'express'
import { TenantController } from '../controllers/TenantController'

const authRouter = express.Router()

import { TenantService } from '../services/TenantService'
import { AppDataSource } from '../config/data-source'
import { Tenant } from '../entity/Tenants'
import logger from '../config/logger'

const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService, logger)

authRouter.post('/', (req, res, next) =>
  tenantController.create(req, res, next),
)

export default authRouter
