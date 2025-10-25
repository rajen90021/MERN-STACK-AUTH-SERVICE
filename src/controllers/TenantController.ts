import { NextFunction, Request, Response } from 'express'
import { TenantService } from '../services/TenantService'
import { CreateTenantRequest } from '../types'
import logger from './../config/logger'
import { Logger } from 'winston'

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body

    this.logger.info(`Creating tenant ${name} with address ${address}`)

    try {
      const tenant = await this.tenantService.createTenant({ name, address })
      this.logger.info(`Tenant ${tenant.id} created`)
      res.status(201).json(tenant)
    } catch (e) {
      this.logger.error(`Error creating tenant: ${e}`)
      next(e)
      return
    }
  }
}
