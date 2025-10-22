import Request from 'supertest'

import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { roles } from '../../src/constants'

describe('POST /auth/register', () => {
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
    it('should return 201 OK', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      //act
      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)

      // assert
      expect(response.status).toBe(201)
    })

    // testing
    it('it should return valid json response ', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      //act
      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)

      // assert
      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      )
    })

    it('should persist user in database', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      //act
      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)

      // assert
      const userRepository = connection.getRepository(User)

      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users[0]?.firstName).toBe(registerData.firstName)
      expect(users[0]?.lastName).toBe(registerData.lastName)
      expect(users[0]?.email).toBe(registerData.email)
    })

    it('should return id of created user', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      //act
      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)
      // Log the full response body
      console.log('Response body:', response.body)
      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id') // <-- TDD: expect id in response
      expect(typeof response.body.id).toBe('number') // or 'string', depending on your DB
    })

    it('should assign a customer role to the user', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      //act
      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)

      // assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0]).toHaveProperty('role')
      expect(users[0]?.role).toBe(roles.CUSTOMER)
    })

  })

  describe('fields are missing', () => {})
})
