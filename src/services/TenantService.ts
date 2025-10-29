import { Repository } from 'typeorm'
import { Tenant } from '../entity/Tenants'
import { ITenant, TenantQueryParams } from '../types'

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async createTenant(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData)
  }
  async getAll(validatedQuery: TenantQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder('tenant')

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`
      queryBuilder.where("CONCAT(tenant.name, ' ', tenant.address) ILike :q", {
        q: searchTerm,
      })
    }

    const result = await queryBuilder
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy('tenant.id', 'DESC')
      .getManyAndCount()
    return result
  }
  async getSingleTenantById(tenantId: number) {
    return await this.tenantRepository.findOne({
      where: {
        id: tenantId,
      },
    })
  }
  async updateTenant(tenantId: number, tenantData: ITenant) {
    return await this.tenantRepository.update(tenantId, tenantData)
  }
  async deleteTenant(tenantId: number) {
    return await this.tenantRepository.delete(tenantId)
  }
}
