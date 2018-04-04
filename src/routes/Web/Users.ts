import { Router, Request, Response } from 'express'
import { User } from '../../entity/User'
import { createPassword } from '../../util/crypto'
import { asyncMiddleware, NotFoundError } from '../../util/express'
import { JsonController, Get, Param, Body, Post, HttpCode, Put, CurrentUser,
         Patch, Delete, OnUndefined, Redirect, ForbiddenError, Req, Res, UseInterceptor, UseBefore, BadRequestError } from 'routing-controllers'
import { IsString, IsOptional, IsAscii, MinLength, validate, ValidatorConstraint } from 'class-validator'
import { IsNotExistingUser } from '../../Validators/User'

const router = Router()

class UserBody {
  @IsString()
  @IsOptional()
  name?: string

  @IsAscii()
  @IsString()
  gamertag!: string

  @MinLength(8)
  @IsString()
  password!: string
}

// Really bad, but I couldn't figure out how
// to conditionally disable the IsNotExistingUser check
class UserBodyChecked extends UserBody {
  @IsAscii()
  @IsString()
  @IsNotExistingUser({
    message: 'Gamertag $value is taken. Please choose another'
  })
  gamertag!: string
}

const patchUser = async (patch: Partial<UserBody>, user: User) => {
  const { password: plain, ...rest } = patch

  const oldtag = rest.gamertag

  let changed = false
  if (plain) {
    changed = true
    const { password, salt } = await createPassword(plain)
    user.password = password
    user.salt = salt
  }

  for (const i in rest) {
    if (user.hasOwnProperty(i) && rest[i]) {
      changed = true
      user[i] = rest[i]
    }
  }

  return changed
}

const validateUser = async (user: User) => {
  // const errors = await validate(user)
  const otheruser = await User.findOne({ gamertag: user.gamertag })
  if (otheruser && otheruser.id !== user.id) {
    throw new BadRequestError(`Gamertag ${user.gamertag} is taken. Please choose another`)
  }

  // if (errors.length > 0) {
  //   const error = new BadRequestError('Invalid body, check \'errors\' property for more info')
  //   ;(error as any).errors = errors

  //   throw error
  // }
}

@JsonController('/users')
export class UserController {
  @Get()
  async getAll () {
    const users = await User.find()

    return users || []
  }

  @Get('/:tag')
  getOne (@Param('tag') tag: string) {
    return User.findOne({ gamertag: tag })
  }

  @Post()
  @HttpCode(201)
  async create (@Body({ required: true }) user: UserBodyChecked) {
    const { password, salt } = await createPassword(user.password)
    const { gamertag, name } = user

    const newuser = new User({ gamertag
                             , name
                             , password
                             , salt
                             , creationDate: new Date() })

    await newuser.save()

    return newuser
  }

  @Patch('/:tag')
  async updateOne (@Body({ required: true }) patch: Partial<UserBody>,
                   @CurrentUser({ required: true }) user: User,
                   @Param('tag') tag: string,
                   @Res() res: Response) {
    if (tag !== user.gamertag) throw new ForbiddenError('Cannot update unowned user')
    const oldtag = patch.gamertag

    const changed = await patchUser(patch, user)

    if (changed) {
      await validateUser(user)
      await user.save()
      if (oldtag && oldtag !== user.gamertag) {
        res.setHeader('Location', `/users/${user.gamertag}`)
      }
    }

    return res.status(200).send()
  }

  @Put('/:tag')
  async replaceOne (@Body({ required: true }) body: UserBody,
                    @CurrentUser({ required: true }) user: User,
                    @Param('tag') tag: string,
                    @Res() res: Response) {
    if (tag !== user.gamertag) throw new ForbiddenError('Cannot update unowned user')
    const oldtag = body.gamertag

    await patchUser(body, user)

    await validateUser(user)
    await user.save()

    if (oldtag !== user.gamertag) {
      res.setHeader('Location', `/users/${user.gamertag}`)
    }
    return res.status(200).send()
  }

  @Delete('/:tag')
  @OnUndefined(204)
  async removeOne (@CurrentUser({ required: true }) user: User,
                   @Param('tag') tag: string) {
    if (tag !== user.gamertag) throw new ForbiddenError('Cannot update unowned user')
    await user.remove()
  }
}

export default router
