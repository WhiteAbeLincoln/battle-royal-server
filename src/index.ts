import 'reflect-metadata'
import { createConnection } from 'typeorm'
import * as http from 'http'
import * as debug from 'debug'
import App from './App'

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

const bugger = debug('battle-royale:server')

const onListen = (server: http.Server) => () => {
  const addr = server.address()
  const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`
  bugger(`Listening on ${bind}`)
}

const port = normalizePort(process.env.PORT || 3000)

createConnection().then(async connection => {
  const app = new App()
  app.express.set('port', port)

  const server = http.createServer(app.express)
  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListen(server))

}).catch(error => console.error('Error', error))
