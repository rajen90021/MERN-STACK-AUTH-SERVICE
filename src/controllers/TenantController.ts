import { NextFunction, Response, Request } from 'express'
import { TenantService } from '../services/TenantService'
import { CreateTenantRequest, TenantQueryParams } from '../types'

import { matchedData, validationResult } from 'express-validator'
import { Logger } from 'winston'
import createHttpError from 'http-errors'

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
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
      this.logger.error(`Error creating tenant: `, e)
      next(e)
      return
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true })
    try {
      const [tenants, count] = await this.tenantService.getAll(
        validatedQuery as TenantQueryParams,
      )

      this.logger.info('All tenant have been fetched')
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: tenants,
      })

      res.json(tenants)
    } catch (err) {
      next(err)
    }
  }
  async getOne(req: Request, res: Response, next: NextFunction) {
    // Parse and validate numeric tenantId from route params
    const tenantId = Number(req.params?.id)

    if (isNaN(tenantId) || tenantId <= 0) {
      next(createHttpError(400, 'Invalid url param.'))
      return
    }

    try {
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
    } catch (e) {
      // ✅ 5. Catch unexpected errors
      this.logger.error(`Error retrieving tenant ${req.params.id}: `, e)
      const error = createHttpError(500, 'Internal server error')
      next(error)
    }
  }
  async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation errors:', result.array())
      return res.status(400).json({ errors: result.array() })
    }
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
        this.logger.warn(
          `No valid fields provided for update on tenant ${tenantId}`,
        )
        return next(
          createHttpError(
            400,
            'At least one field (name or address) is required',
          ),
        )
      }

      // ✅ Check existence
      const existingTenant =
        await this.tenantService.getSingleTenantById(tenantId)
      if (!existingTenant) {
        this.logger.warn(`Tenant not found for ID: ${tenantId}`)
        return next(createHttpError(404, 'Tenant not found'))
      }

      // ✅ Perform update
      const result = await this.tenantService.updateTenant(tenantId, {
        name,
        address,
      })
      this.logger.info(
        `Tenant ${tenantId} updated. Result: ${JSON.stringify(result)}`,
      )

      // ✅ Handle TypeORM response
      if (result.affected === 0) {
        this.logger.warn(`No rows affected while updating tenant ${tenantId}`)
        return next(createHttpError(404, 'Tenant not found or no changes made'))
      }

      return res.status(200).json({
        message: 'Tenant updated successfully',
      })
    } catch (e) {
      this.logger.error(`Error updating tenant ${req.params.id}: `, e)
      next(createHttpError(500, 'Internal server error'))
    }
  }
  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = Number(req.params.id)

      // ✅ Validate ID
      if (isNaN(tenantId) || tenantId <= 0) {
        this.logger.warn(`Invalid tenant ID: ${req.params.id}`)
        return next(createHttpError(400, 'Invalid tenant ID'))
      }

      // ✅ Check existence
      const existingTenant =
        await this.tenantService.getSingleTenantById(tenantId)
      if (!existingTenant) {
        this.logger.warn(`Tenant not found for ID: ${tenantId}`)
        return next(createHttpError(404, 'Tenant not found'))
      }

      // ✅ Perform deletion
      const result = await this.tenantService.deleteTenant(tenantId)
      this.logger.info(
        `Tenant ${tenantId} deleted. Result: ${JSON.stringify(result)}`,
      )

      // ✅ Handle TypeORM response
      if (result.affected === 0) {
        this.logger.warn(`No rows affected while deleting tenant ${tenantId}`)
        return next(createHttpError(404, 'Tenant not found or no changes made'))
      }

      return res.status(200).json({
        message: 'Tenant deleted successfully',
      })
    } catch (e) {
      this.logger.error(`Error deleting tenant ${req.params.id}: `, e)
      next(createHttpError(500, 'Internal server error'))
    }
  }
}
