import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// Generate keys in the project root (not inside /scripts)
const certsDir = path.join(process.cwd(), 'certs')

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true })
}

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
  },
})

console.log('publicKey:', publicKey)
console.log('privateKey:', privateKey)

// ✅ Save directly to certs folder at project root
fs.writeFileSync(path.join(certsDir, 'publicKey.pem'), publicKey)
fs.writeFileSync(path.join(certsDir, 'privateKey.pem'), privateKey)

console.log(`✅ Keys successfully saved to: ${certsDir}`)
console.log('Public and private keys generated successfully.')