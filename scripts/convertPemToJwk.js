import fs from 'fs'

import rsaPemToJwk from 'rsa-pem-to-jwk'



const privateKeyPem = fs.readFileSync('./certs/privateKey.pem')

const privateKeyJwk = rsaPemToJwk(privateKeyPem, { use: 'sig' }, "public")

console.log(JSON.stringify(privateKeyJwk))
