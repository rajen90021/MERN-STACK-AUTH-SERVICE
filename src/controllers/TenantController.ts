import { NextFunction, Request, Response } from 'express'
import { TenantService } from '../services/TenantService'
import { AuthRequest, CreateTenantRequest } from '../types'
import logger from './../config/logger'
import { validationResult } from 'express-validator'
import { Logger } from 'winston'
import createHttpError from 'http-errors'

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {

    
    const result =  validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation errors:', result.array())
      return res.status(400).json({ errors: result.array() })
    }

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

  async getListTenant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantList = await this.tenantService.getListTenant()
      this.logger.info(`Tenant list: ${tenantList}`)
      res.status(200).json(tenantList)
    } catch (e) {
      this.logger.error(`Error getting tenant list: ${e}`)
      next(e)
      return
    }
  } 
async getSingleTenantById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = Number(req.params.id)

      // ✅ 1. Validate tenantId
      if (isNaN(tenantId) || tenantId <= 0) {
        this.logger.warn(`Invalid tenant ID provided: ${req.params.id}`)
        const error = createHttpError(400, 'Invalid tenant ID')
        next(error)
        return
      }

      // ✅ 2. Fetch tenant
      const tenant = await this.tenantService.getSingleTenantById(tenantId)

      // ✅ 3. Handle not found
      if (!tenant) {
        this.logger.warn(`Tenant not found for ID: ${tenantId}`)
        const error = createHttpError(404, 'Tenant not found')
        next(error)
        return
      }

      // ✅ 4. Success
      this.logger.info(`Tenant ${tenantId} details retrieved.`)
      return res.status(200).json(tenant)

    } catch (e: any) {
      // ✅ 5. Catch unexpected errors
      this.logger.error(`Error retrieving tenant ${req.params.id}: ${e.message || e}`)
      const error = createHttpError(500, 'Internal server error')
      next(error)
    }
  }
  async updateTenant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = Number(req.params.id)
      const { name, address } = req.body

      // ✅ Validate ID
      if (isNaN(tenantId) || tenantId <= 0) {
        this.logger.warn(`Invalid tenant ID: ${req.params.id}`)
        return next(createHttpError(400, 'Invalid tenant ID'))
      }

      // ✅ Validate body
      if (!name && !address) {
        this.logger.warn(`No valid fields provided for update on tenant ${tenantId}`)
        return next(createHttpError(400, 'At least one field (name or address) is required'))
      }

      // ✅ Check existence
      const existingTenant = await this.tenantService.getSingleTenantById(tenantId)
      if (!existingTenant) {
        this.logger.warn(`Tenant not found for ID: ${tenantId}`)
        return next(createHttpError(404, 'Tenant not found'))
      }

      // ✅ Perform update
      const result = await this.tenantService.updateTenant(tenantId, { name, address })
      this.logger.info(`Tenant ${tenantId} updated. Result: ${JSON.stringify(result)}`)

      // ✅ Handle TypeORM response
      if (result.affected === 0) {
        this.logger.warn(`No rows affected while updating tenant ${tenantId}`)
        return next(createHttpError(404, 'Tenant not found or no changes made'))
      }

      return res.status(200).json({
        message: 'Tenant updated successfully',
     
      })
    } catch (e: any) {
      this.logger.error(`Error updating tenant ${req.params.id}: ${e.message || e}`)
      next(createHttpError(500, 'Internal server error'))
    }
  }
  async deleteTenant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = Number(req.params.id)

      // ✅ Validate ID
      if (isNaN(tenantId) || tenantId <= 0) {
        this.logger.warn(`Invalid tenant ID: ${req.params.id}`)
        return next(createHttpError(400, 'Invalid tenant ID'))
      }
      

      // ✅ Check existence
      const existingTenant = await this.tenantService.getSingleTenantById(tenantId)
      if (!existingTenant) {
        this.logger.warn(`Tenant not found for ID: ${tenantId}`)
        return next(createHttpError(404, 'Tenant not found'))
      }
      

      // ✅ Perform deletion
      const result = await this.tenantService.deleteTenant(tenantId)
      this.logger.info(`Tenant ${tenantId} deleted. Result: ${JSON.stringify(result)}`)

      // ✅ Handle TypeORM response
      if (result.affected === 0) {
        this.logger.warn(`No rows affected while deleting tenant ${tenantId}`)
        return next(createHttpError(404, 'Tenant not found or no changes made'))
      }

      return res.status(200).json({
        message: 'Tenant deleted successfully',
     
      })
    } catch (e: any) {
      this.logger.error(`Error deleting tenant ${req.params.id}: ${e.message || e}`)
      next(createHttpError(500, 'Internal server error'))
    }
  }
}
