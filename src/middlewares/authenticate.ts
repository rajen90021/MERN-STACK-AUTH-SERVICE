import { expressjwt } from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import { Config } from '../config'
import { Request } from 'express'

export default expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: Config.JWKS_URI!,
  }),
  algorithms: ['RS256'],
  getToken(req: Request) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.split(' ')[1] !== undefined) {
      const token = authHeader.split(' ')[1]
      if (token) {
        return token
      }
    }

    const { accessToken: token } = req.cookies
    if (token) {
      return token
    }
    return null
  },
})
