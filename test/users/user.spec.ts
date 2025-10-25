import createJWKSMock from 'mock-jwks'
import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { roles } from '../../src/constants'


 

describe('GET /auth/self', () => {
  let connection: DataSource
  let jwks:ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
     jwks = createJWKSMock('http://localhost:5501')
    connection = await AppDataSource.initialize()
   
  })

  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()
  })
   afterEach(()=>{
    jwks.stop()
   })

  afterAll(async () => {
    await connection.destroy()
  })

        describe('given all fields',()=>{

            it('should return the 200 status code', async ()=>{
 // arrange             

                            const token = jwks.token({
                                sub: "1",
                                role: roles.CUSTOMER,
                            })
                            // act
                const response = await request(app).get('/auth/self').set('Cookie',[`accessToken=${token}`]).send();
                expect(response.statusCode).toBe(200)
            })

             it('should return the user data ', async ()=>{

                        const userData = {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'test4@example.com',
                            password: 'password1234',
                        }
                //  register user 
                     const userRepository = connection.getRepository(User)
                     const user = await userRepository.save({...userData,role:roles.CUSTOMER})
                            // arrange
                            const token = jwks.token({
                                sub: String(user.id),
                                role: user.role,
                            })
                            const response = await request(app).get('/auth/self').set('Cookie',[`accessToken=${token}`]).send();
                            console.log(response.body)

                                expect(response.body.id).toBe(user.id)
             
            })


             it('should not return the password', async ()=>{

                        const userData = {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'test4@example.com',
                            password: 'password1234',
                        }
                //  register user 
                     const userRepository = connection.getRepository(User)
                     const user = await userRepository.save({...userData,role:roles.CUSTOMER})
                            // arrange
                            const token = jwks.token({
                                sub: String(user.id),
                                role: user.role,
                            })
                            const response = await request(app).get('/auth/self').set('Cookie',[`accessToken=${token}`]).send();
                            console.log(response.body)

                               expect(response.body).not.toHaveProperty('password')
             
            })
            })
 
})
