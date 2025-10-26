import { DataSource } from 'typeorm'
import app from '../../src/app'
import { AppDataSource } from '../../src/config/data-source'
import request from 'supertest'
import { roles } from '../../src/constants'
import { Tenant } from '../../src/entity/Tenants'
import createJWKSMock from 'mock-jwks'

describe('POST /tenants', () => {
 let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  let adminToken :string

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501')
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()

    adminToken = jwks.token({ sub: '123', role: roles.ADMIN })
  })
  afterEach( async() => {
    jwks.stop()
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
      const response = await request(app).post('/tenants').set('Cookie', [`accessToken=${adminToken}`]).send(tenantsData)
      expect(response.statusCode).toBe(201)
    })

    it('should create tenant in db', async () => {
      const tenantsData = {
        name: 'tanat data ',
        address: 'tenant address',
      }
      const response = await request(app).post('/tenants').set('Cookie', [`accessToken=${adminToken}`]).send(tenantsData)
      const tenantRepository = connection.getRepository(Tenant)

      const tenant = await tenantRepository.find()
      expect(tenant).toHaveLength(1)
      
    })

     it('should return 401 if user is not authenicated', async () => {
      const tenantsData = {
        name: 'tanat data ',
        address: 'tenant address',
      }
      const response = await request(app).post('/tenants').send(tenantsData)

      expect(response.statusCode).toBe(401)
      
      const tenantRepository = connection.getRepository(Tenant)

      const tenant = await tenantRepository.find()
      expect(tenant).toHaveLength(0)
      
    })


    it('should return 403 if user is not admin', async () => {

        const managerToken = jwks.token({ sub: '456', role: roles.MANAGER })

      const tenantsData = {
        name: 'tanat data ',
        address: 'tenant address',
      }
      const response = await request(app).post('/tenants').set('Cookie', [`accessToken=${managerToken}`]).send(tenantsData)

      expect(response.statusCode).toBe(403)
      
      const tenantRepository = connection.getRepository(Tenant)

      const tenant = await tenantRepository.find()
      expect(tenant).toHaveLength(0)
      
    })
  })
})
