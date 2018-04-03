import { Router } from 'express'
import { User } from '../../entity/User'
import { pbkdf2, createSalt } from '../../util/crypto'
import { asyncMiddleware, NotFoundError } from '../../util/express'

const router = Router()

const validUser = (user: any) => {
  return (user
       && typeof user.gamertag === 'string'
       && typeof user.name === 'string'
       && typeof user.password === 'string')
}

router.get('/', asyncMiddleware(async (req, res, next) => {
  const users = await User.find()

  res.json({
    users: users || []
  })
}))

router.post('/', asyncMiddleware(async (req, res, next) => {
  console.log(req.body)
  const body = req.body
  if (!validUser(body)) throw new Error('Invalid user object')

  const salt = await createSalt()
  const password = await pbkdf2(body.password, salt)

  const { gamertag, name } = body

  const user = new User()
  user.setProperties({ gamertag
                     , name
                     , password
                     , salt
                     , creationDate: new Date() })

  await user.save()

  res.status(201).json(user)
}))

router.get('/:tag', asyncMiddleware(async (req, res, next) => {
  const user = await User.findOne({ gamertag: req.params.tag })

  if (!user) throw new NotFoundError()

  res.json(user)
}))

export default router
