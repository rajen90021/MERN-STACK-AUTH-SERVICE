import { Repository } from 'typeorm'
import { Tenant } from '../entity/Tenants'
import { ITenant } from '../types'

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) { }
  async createTenant(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData)
  }
  async getListTenant() {
    return await this.tenantRepository.find()
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
