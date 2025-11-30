import 'reflect-metadata'
import express from 'express'
import cookieParser from 'cookie-parser'

import createHttpError from 'http-errors'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenants'
import userRouter from './routes/user'
import cors from 'cors'
import { Config } from './config'
import { globalErrorHandler } from './middlewares/globalErrorHandler'
const app = express()
app.use(express.static('public', { dotfiles: 'allow' }))
app.use(cookieParser())

app.use(express.json())

app.use(
  cors({
    origin: Config.FRONTEND_URL,
    credentials: true,
  }),
)

app.get('/', (req, res, next) => {
  const err = createHttpError(200, 'you cannot access this route')
  next(err)
})

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(globalErrorHandler)

export default app
