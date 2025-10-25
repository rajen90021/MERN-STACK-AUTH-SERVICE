import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { roles } from '../../src/constants'
import { RefreshToken } from '../../src/entity/RefreshToken'

describe('POST /auth/login', () => {
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

  describe('given all required fields', () => {
    it('should return 200 OK if login is successful', async () => {
      // Arrange — create user first
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      // Create a user by calling the register endpoint
      await request(app).post('/auth/register').send(registerData)

      // Act — now try to login
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      })

      // Cookies should be set
      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(
        Array.isArray(cookies) &&
          cookies.some((c: string) => c.includes('accessToken')),
      ).toBe(true)
      expect(
        Array.isArray(cookies) &&
          cookies.some((c: string) => c.includes('refreshToken')),
      ).toBe(true)
    })

    it('should return 400 if password is incorrect', async () => {
      const registerData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'wrongpass@example.com',
        password: 'password123',
      }

      await request(app).post('/auth/register').send(registerData)

      const response = await request(app).post('/auth/login').send({
        email: 'wrongpass@example.com',
        password: 'wrongpassword',
      })

      expect(response.status).toBe(400)
    })

    it('should return 400 if user does not exist', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'nouser@example.com',
        password: 'password123',
      })

      expect(response.status).toBe(400)
    })

    it('should return 400 if fields are missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: '' })

      expect(response.status).toBe(400)
      expect(response.body.errors || response.body.message).toBeDefined()
    })

    it('should store a refresh token in the database after login', async () => {
      const registerData = {
        firstName: 'Token',
        lastName: 'Tester',
        email: 'token@example.com',
        password: 'password123',
      }

      await request(app).post('/auth/register').send(registerData)

      await request(app).post('/auth/login').send({
        email: 'token@example.com',
        password: 'password123',
      })

      const refreshRepo = connection.getRepository(RefreshToken)
      const tokens = await refreshRepo.find()
      expect(tokens.length).toBeGreaterThan(0)
    })
  })
})
