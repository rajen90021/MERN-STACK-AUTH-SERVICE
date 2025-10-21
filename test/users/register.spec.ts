import Request from 'supertest'

import app from '../../src/app'

describe('POST /auth/register', () => {
  describe('given all required fields', () => {
    it('should return 200 OK', async () => {
      // arrange
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }

      //act
      const response = await Request(app)
        .post('/auth/register')
        .send(registerData)

      // assert
      expect(response.status).toBe(201)
    })

    it('it should return valid json response ', async () => {
      // arrange
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
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
  })

  describe('fields are missing', () => {})
})
