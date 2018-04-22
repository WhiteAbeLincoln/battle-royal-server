// tslint:disable:ter-indent
import * as io from 'socket.io'
import * as debug from 'debug'
import { Server as HTTPServer } from 'http'
import { APP_PREFIX, SECRET } from '../util/constants'
import { withAuth } from '../util/socketio'
import { verify } from 'jsonwebtoken'
import { generateMap } from './models/World'
import { EmitKeys, MessageKeys } from './keys'
import { State, initialState } from './models/StateModel'
import { RecieveChat } from './functions/Chat'
import { SetSpawn } from './functions/Spawn'
import { ReceiveAction } from './functions/Action'
import { PollHandler, VoteKick, VoteHandler, VoteStart } from './functions/Vote'
import { sendMessage, startGame } from './helpers'
import { User } from './models/User'

export const bugger = debug(`${APP_PREFIX}:game`)

export interface Message<T> {
  data: T
}

export interface AuthStatus { token: { gamertag: string } }
export type SocketFunc = (socket: io.Socket, server: io.Server) => (auth: AuthStatus, s: State) => void

export const createIO = (http: HTTPServer) => {
  // creates a new socket server that requires authentication
  const { io: socketserver, authobs: authed } = withAuth({ secret: SECRET, timeout: 5000 })(io(http))
  const state: State = initialState

  // notifies clients of join
  const notifyOfJoin: SocketFunc = (socket, server) => (auth, state) => {
    bugger(`Notifing other users of ${auth.token.gamertag}'s connection`)

    const userList = [...state.UserMap.values()].map(u => u.token)
    server.emit(EmitKeys.UPDATE_USERS, userList)
    sendMessage(socket, `${auth.token.gamertag} joined`, '<SERVER>', true)
  }

  const emitMap: SocketFunc = (socket, _1) => (_2, _3) => {
    if (!state.map) {
      // if a map doesn't already exist, create and push to all clients
      generateMap().then(m => {
        socketserver.emit(EmitKeys.UPDATE_MAP, m)
        state.map = m
      })
    } else {
      // else push existing map to just the new client
      socket.emit(EmitKeys.UPDATE_MAP, state.map)
    }
  }

  // functions to run with the authenticated socket
  const functions: SocketFunc[] = [ notifyOfJoin
                                  , emitMap
                                  , RecieveChat
                                  , SetSpawn
                                  , PollHandler
                                  , VoteKick
                                  , VoteHandler
                                  , VoteStart
                                  , ReceiveAction
                                  ]

  // the auth subscription emits an authenticated client socket
  authed.subscribe(socket => {
    const authinfo: AuthStatus = (socket as any).auth
    state.UserMap.set(authinfo.token.gamertag, new User(authinfo.token, socket))

    if (state.started || state.UserMap.size + 1 === 100) {
      // don't allow connections after game has started
      state.UserMap.delete(authinfo.token.gamertag)
      socket.disconnect()
    }

    if (state.UserMap.size === 100) {
      state.started = true
      startGame(socketserver, state)
    }

    // These functions subscribe to messages from the server and/or modify state
    functions.forEach(f => f(socket, socketserver)(authinfo, state))

    // runs on disconnect of a user
    socket.on('disconnect', () => {
      bugger('User %s disconnected', authinfo.token.gamertag)
      // remove the user from the usermap
      state.UserMap.delete(authinfo.token.gamertag)
      // update the userlist for the client
      const userList = [...state.UserMap.values()].map(u => u.token)
      // tell clients to update their user list
      socketserver.emit(EmitKeys.UPDATE_USERS, userList)
      // notify clients of user leaving in chat
      sendMessage(socketserver, `${authinfo.token.gamertag} left`, '<SERVER>')
    })
  })
}
