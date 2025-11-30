// globalErrorHandler.ts
import { Request, Response } from 'express'
import { HttpError } from 'http-errors'
import logger from '../config/logger'

export const globalErrorHandler = async (
  err: HttpError,
  req: Request,
  res: Response,
) => {
  const { v4: uuidv4 } = await import('uuid') // ✅ dynamic import

  const errorId = uuidv4()
  const statusCode = err.status || 500
  const isProduction = process.env.NODE_ENV === 'production'

  let message = 'Internal server error'
  if (statusCode === 400) {
    message = err.message
  }

  logger.error(err.message, {
    id: errorId,
    statusCode,
    error: err.stack,
    path: req.path,
    method: req.method,
  })

  res.status(statusCode).json({
    errors: [
      {
        ref: errorId,
        type: err.name,
        msg: message,
        path: req.path,
        method: req.method,
        location: 'server',
        stack: isProduction ? null : err.stack,
      },
    ],
  })
}
