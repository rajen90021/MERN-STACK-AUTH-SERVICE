import { DataSource } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import request from 'supertest'
import { roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenants'

describe('POST /tenants', () => {
  let connection: DataSource

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('gven all fields', () => {
    it('should return  201 status code ', async () => {
      const tenantsData = {
        name: 'tanat data ',
        address: 'tenant address',
      }
      const response = await request(app).post('/tenants').send(tenantsData)
      expect(response.statusCode).toBe(201)
    })

    it('should create tenant in db', async () => {
      const tenantsData = {
        name: 'tanat data ',
        address: 'tenant address',
      }
      const response = await request(app).post('/tenants').send(tenantsData)
      const tenantRepository = connection.getRepository(Tenant)

      const tenant = await tenantRepository.find()
      expect(tenant).toHaveLength(1)
    })
  })
})
