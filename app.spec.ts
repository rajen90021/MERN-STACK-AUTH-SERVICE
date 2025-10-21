import app from './src/app'
import { calculationsDiscount } from './src/utils'
import request from 'supertest'

describe('App', () => {
  it('should return correct discount amount ', () => {
    const discountAmount = calculationsDiscount(100, 10)
    expect(discountAmount).toBe(90)
  })

  it('should return 200 OK', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
  })
})
