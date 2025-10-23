import Request from 'supertest'

import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { roles } from '../../src/constants'
import { isJwt } from '../utils'

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
      await Request(app).post('/auth/register').send(registerData)

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
      const body = response.body as { id?: number | string }
      expect(typeof body.id).toBe('number') // or 'string', depending on your DB
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
      await Request(app).post('/auth/register').send(registerData)

      // assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0]).toHaveProperty('role')
      expect(users[0]?.role).toBe(roles.CUSTOMER)
    })

    it('it should store a hash password in the database', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      //act
      await Request(app).post('/auth/register').send(registerData)

      // assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()

      expect(users[0]).toHaveProperty('password')
      expect(users[0]?.password).not.toBe(registerData.password)
    })

    it('it should return 400 status code if email is already exist ', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      const userRepository = connection.getRepository(User)
      await userRepository.save({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        role: roles.CUSTOMER,
      })

      //act
      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)

      const users = await userRepository.find()
      expect(users).toHaveLength(1)

      // asserts

      expect(response.status).toBe(400)
    })

    it('should return the access token and refresh token inside a cookie', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      }

      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)

      const cookies = response.headers['set-cookie'] || []
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies]

      const accessCookie = cookieArray.find((c) => c.startsWith('accessToken='))
      const refreshCookie = cookieArray.find((c) =>
        c.startsWith('refreshToken='),
      )

      expect(accessCookie).not.toBeNull()
      expect(refreshCookie).not.toBeNull()
    })
  })

  describe('fields are missing', () => {
    it('it should return 400 status code if email field  is missing', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        password: 'password123',
      }

      //act
      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)

      // asserts

      expect(response.status).toBe(400)

      const users = await connection.getRepository(User).find()
      expect(users).toHaveLength(0)
    })
  })

  describe('field are not in proper format', () => {
    it(' should trim the email field', async () => {
      // arrange
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: ' test@example.com ',
        password: 'password123',
      }
      //act
      await Request(app).post('/auth/register').send(registerData)

      // asserts

      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0]?.email).toBe('test@example.com')
    })

    it.todo('should return 400 status code if email is not a valid email ')
    it.todo(
      'should return 400 status code if password is less than 6 characters long',
    )

    it.todo('should return 400 status code if email is not a valid email ')
  })
})
