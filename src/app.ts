import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import logger from './config/logger'
import createHttpError, { HttpError } from 'http-errors'
import authRouter from './routes/auth'

const app = express()

app.get('/', (req, res, next) => {
  const err = createHttpError(200, 'you cannot access this route')
  next(err)
})

app.use('/auth', authRouter)

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[${req.method}] ${req.url} - ${err.message}`)
  logger.error(err.message)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: '',
      },
    ],
  })
})

export default app
