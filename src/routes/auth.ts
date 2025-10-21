import express from 'express'
import app from '../app'
import { AuthController } from '../controllers/AuthController'

const authRouter = express.Router()

const authController = new AuthController()

authRouter.post('/register', authController.register)

export default authRouter
