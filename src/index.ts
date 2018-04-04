import 'reflect-metadata'
import { createConnection } from 'typeorm'
import * as express from 'express'
import * as http from 'http'
import * as debug from 'debug'
import * as logger from 'morgan'
import { createExpressServer, Action, UnauthorizedError } from 'routing-controllers'
import { UserController, LoginController } from './routes'
import { User } from './entity/User'
import { verify } from 'jsonwebtoken'

const bugger = debug('battle-royale:server')
export const secret = 'THIS IS TOTALLY INSECURE'

const normalizePort = (val: number | string): number | string | boolean => {
  const port: number = (typeof val === 'string') ? parseInt(val, 10) : val

  // port is named pipe
  if (isNaN(port)) {
    return val
  } else if (port >= 0) {
  // numbered port
    return port
  } else {
  // invalid port
    return false
  }
}

const onError = (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') throw error
  const bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

const onListen = (server: http.Server) => () => {
  const addr = server.address()
  const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`
  bugger(`Listening on ${bind}`)
}

const port = normalizePort(process.env.PORT || 3000)

createConnection().then(async connection => {
  const app = createExpressServer({
    cors: true,
    controllers: [ UserController
                 , LoginController ],
    currentUserChecker: async (action: Action) => {
      const token = (action.request.headers['authorization'] as string).replace('Bearer ', '')
      try {
        const info: any = verify(token, secret)

        if (typeof info === 'string') throw new UnauthorizedError('Invalid Token')

        return User.findOne({ gamertag: info.gamertag })
      } catch (e) {
        throw new UnauthorizedError(`Invalid Token: ${e.message || ''}`)
      }
    }
  })

  app.use(logger('dev'))

  const server = http.createServer(app)
  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListen(server))

}).catch(error => console.error('Error', error))
