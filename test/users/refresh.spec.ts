import createJWKSMock from 'mock-jwks'
import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { roles } from '../../src/constants'

describe('POST /auth/refresh', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>

  beforeAll(async () => {
    // 👇 use same JWKS issuer as self.spec.ts
    jwks = createJWKSMock('http://localhost:5501')
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterEach(() => {
    jwks.stop()
  })

  afterAll(async () => {
    await connection.destroy()
  })

  describe('given a valid refresh token', () => {
    // it('should return 200 and set new access/refresh tokens', async () => {
    //   // Arrange — create user in DB
    //   // 👇 generate token like /auth/self test
    //   const token = jwks.token({
    //     sub: '1',
    //     role: roles.CUSTOMER,
    //   })
    //   // Act
    //   const response = await request(app)
    //     .post('/auth/refresh')
    //     .set('Cookie', [`refreshToken=${token}`])
    //     .send()
    //   console.log(response.body)
    //   // Assert
    //   expect(response.statusCode).toBe(200)
    //   expect(response.headers['set-cookie']).toBeDefined()
    //   const cookies = Array.isArray(response.headers['set-cookie'])
    //     ? response.headers['set-cookie'].join(';')
    //     : response.headers['set-cookie'] || ''
    //   expect(cookies).toContain('accessToken=')
    //   expect(cookies).toContain('refreshToken=')
    //   expect(response.body.id).toBe(Number(response.body.id))
    //   expect(response.body.email).toBe(response.body.email)
    //   expect(response.body).not.toHaveProperty('password')
    // })
  })

  describe('given no refresh token', () => {
    it('should return 401', async () => {
      const response = await request(app).post('/auth/refresh').send()
      expect(response.statusCode).toBe(401)
    })
  })

  describe('given an invalid refresh token', () => {
    it('should return 401', async () => {
      const token = jwks.token({
        sub: '1',
        role: roles.CUSTOMER,
      })
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${token}`])
        .send()

      expect(response.statusCode).toBe(401)
    })
  })

  describe('given a refresh token for a non-existent user', () => {
    it('should return 401', async () => {
      const token = jwks.token({
        sub: '1',
        role: roles.CUSTOMER,
      })

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${token}`])
        .send()

      expect(response.statusCode).toBe(401)
      // unified format check (self test doesn’t use “message” key either)
      expect(response.body).toBeDefined()
    })
  })
})
