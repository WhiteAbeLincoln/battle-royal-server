import { Post, JsonController, BodyParam, UnauthorizedError } from 'routing-controllers'
import { User } from '../../entity/User'
import { pbkdf2 } from '../../util/crypto'
import { sign } from 'jsonwebtoken'
import { APP_PREFIX, SECRET } from '../../util/constants'
import * as debug from 'debug'

const bugger = debug(`${APP_PREFIX}:users`)

@JsonController('/login')
export class LoginController {

  getUser = async (username: string, password: string) => {
    const user = await User.findOne({ gamertag: username })
    if (!user) return null

    const passw = await pbkdf2(password, user.salt)

    if (user.password === passw) return user

    return null
  }

  @Post()
  async post (@BodyParam('gamertag', { required: true }) gamertag: string,
              @BodyParam('password', { required: true }) password: string) {
    bugger('Logging in user %s', gamertag)
    const valid = await this.getUser(gamertag, password)

    if (!valid) throw new UnauthorizedError('Invalid username or password')

    const token = sign(valid.toJSON(), SECRET)
    bugger('User %s successfully logged in', gamertag)

    return {
      token,
      user: valid
    }
  }
}
