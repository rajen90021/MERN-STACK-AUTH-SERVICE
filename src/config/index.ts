import { config } from 'dotenv'
import path from 'path'

config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'dev'}`),
})
console.log('process.env.NODE_ENV:', process.env.NODE_ENV)
console.log('JWKS_URI:', process.env.JWKS_URI)

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  JWKS_URI,
  PRIVATE_KEY,
  FRONTEND_URL,
} = process.env

export const Config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  JWKS_URI,
  PRIVATE_KEY,
  FRONTEND_URL,
}
