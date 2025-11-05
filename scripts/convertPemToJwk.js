// scripts/convertPemToJwk.js
import fs from 'fs'
import rsaPemToJwk from 'rsa-pem-to-jwk'
import path from 'path'

const publicKeyPem = fs.readFileSync(path.join(process.cwd(), 'certs/publicKey.pem'))
const jwk = rsaPemToJwk(publicKeyPem, { use: 'sig' }, 'public')

const jwks = { keys: [jwk] }

const jwksDir = path.join(process.cwd(), 'public/.well-known')
fs.mkdirSync(jwksDir, { recursive: true })

fs.writeFileSync(path.join(jwksDir, 'jwks.json'), JSON.stringify(jwks, null, 2))

console.log('✅ JWKS generated successfully at public/.well-known/jwks.json')
