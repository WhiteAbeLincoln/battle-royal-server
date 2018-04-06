import * as io from 'socket.io'
import * as debug from 'debug'
import { Server as HTTPServer } from 'http'
import { APP_PREFIX, SECRET } from '../util/constants'
import { withAuth } from '../util/socketio'
import { User } from '../entity/User'
import { verify } from 'jsonwebtoken'

const MessageKeys = {
  AUTHENTICATE: 'authenticate',
  CHAT: 'chat_message',
  SET_SPAWN_LOCATION: 'set_spawn_location'
}

const EmitKeys = {
  ERROR: 'server_error',
  AUTHENTICATED: 'authenticated',
  NEW_MESSAGE: 'new_chat_message',
  UPDATE_USERS: 'update_users'
}

const bugger = debug(`${APP_PREFIX}:socket`)

interface Message<T> {
  data: T
}

interface Error {
  message: string
  status: number
}

interface AuthStatus {
  token?: { gamertag: string }
}

const emitError = (data: Error) => (socket: io.Socket) => {
  socket.emit(EmitKeys.ERROR, JSON.stringify(data))
}

export const createIO = (http: HTTPServer) => {
  const { io: socketserver, authobs: authed } = withAuth({ secret: SECRET, timeout: 5000 })(io(http))
  let userList: Array<{ gamertag: string }> = []

  authed.subscribe(socket => {
    const authinfo = (socket as any).auth
    bugger(`Notifing other users of ${authinfo.token.gamertag}'s connection`)
    userList.push(authinfo.token)
    socketserver.emit(EmitKeys.UPDATE_USERS, JSON.stringify(userList))
    socketserver.emit(EmitKeys.NEW_MESSAGE, JSON.stringify({ from: '<SERVER>', data: `${authinfo.token.gamertag} joined` }))
  })

  socketserver.on('connection', socket => {
    bugger('A user connected')
    let authinfo: AuthStatus = (socket as any).auth

    socket.on(MessageKeys.CHAT, (msg: string) => {
      const message: Message<string> = JSON.parse(msg)

      bugger('Chat recieved from %s: %s', authinfo.token && authinfo.token.gamertag, message.data)
      socket.broadcast.emit(EmitKeys.NEW_MESSAGE,
                            JSON.stringify({ from: authinfo.token && authinfo.token.gamertag
                                           , data: message.data }))
    })

    socket.on(MessageKeys.SET_SPAWN_LOCATION, (msg: string) => {
      const message: Message<{x: number, y: number}> = JSON.parse(msg)
      const currentName = authinfo.token ? authinfo.token.gamertag : 'Anonymous'

      bugger('%s set spawn location to %d, %d', currentName, message.data.x, message.data.y)
    })

    socket.on('disconnect', () => {
      const currentName = authinfo.token ? authinfo.token.gamertag : 'Anonymous'
      bugger('User %s disconnected', currentName)
      userList = userList.filter(u => u.gamertag !== currentName)
      socketserver.emit(EmitKeys.UPDATE_USERS, JSON.stringify(userList))
      socketserver.emit(EmitKeys.NEW_MESSAGE, JSON.stringify({ from: '<SERVER>', data: `${currentName} left` }))
      authinfo = {}
    })
  })
}
