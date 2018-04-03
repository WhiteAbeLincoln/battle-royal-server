import { Router } from 'express'
import * as jwt from 'express-jwt'
import UsersRouter from './Users'
// import LoginRouter from './Login'

const router = Router()

// router.get('/', (req, res) => {
//   res.status(404).end()
// })

router.use('/user', UsersRouter)
// router.use('/login', LoginRouter)

export default router
