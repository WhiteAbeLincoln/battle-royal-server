import * as crypto from 'crypto'
import { promisify } from 'util'

export const pbkdf2 = async (password: string, salt: string) => {
  const promised = promisify(crypto.pbkdf2)
  return (await promised(password, salt, 4096, 512, 'sha512')).toString('base64')
}

export const createSalt = async () => (await promisify(crypto.randomBytes)(512)).toString('base64')
