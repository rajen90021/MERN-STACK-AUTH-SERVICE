import { Repository } from 'typeorm'
import { Tenant } from '../entity/Tenants'
import { ITenants } from '../types'

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async createTenant(tenantData: ITenants) {
    return await this.tenantRepository.save(tenantData)
  }
}
