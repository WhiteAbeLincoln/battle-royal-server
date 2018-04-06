import { Server } from 'socket.io'
import { verify, VerifyCallback } from 'jsonwebtoken'
import * as debug from 'debug'
import { APP_PREFIX } from './constants'
import { Deferred } from './deferred'
import { Subject } from 'rxjs/Subject'

export interface AuthOptions {
  secret: string,
  timeout: number
}

const bugger = debug(`${APP_PREFIX}:socket-auth`)

// Adapted from https://wmyers.github.io/technical/nodejs/Simple-JWT-auth-for-SocketIO

export const withAuth = (options: AuthOptions) => (socketio: Server) => {
  const defer = new Subject<SocketIO.Socket>()
  socketio.on('connection', socket => {
    (socket as any).auth = {}

    // temporarily delete socket from connected namespace
    delete socketio.sockets.connected[socket.id]

    const timeout = setTimeout(() => {
      socket.emit('unauthorized', { status: 401, message: 'Unauthorized' })
      socket.disconnect(true)
    }, options.timeout)

    const authenticate = (data: string) => {
      clearTimeout(timeout)

      verify(data, options.secret, ((err, decoded) => {
        if (err) {
          socket.emit('unauthorized', { status: 401, message: 'Unauthorized', error: err })
          socket.disconnect(true)
          return
        }

        if (decoded) {
          socketio.sockets.connected[socket.id] = socket
          if (typeof decoded === 'string') {
            decoded = JSON.parse(decoded)
          }

          (socket as any).auth.token = decoded
          ;(socket as any).auth.connectedOn = new Date()

          defer.next(socket)

          socket.on('disconnect', () => {
            bugger('SOCKET [%s] DISCONNECTED', socket.id)
          })

          bugger('SOCKET [%s] AUTHENTICATED', socket.id)
          socket.emit('authenticated', decoded)
        }
      }) as VerifyCallback)
    }

    socket.on('authenticate', authenticate)
  })

  return { io: socketio, authobs: defer.asObservable() }
}
