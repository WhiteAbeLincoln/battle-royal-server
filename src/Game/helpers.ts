import { Socket, Server } from 'socket.io'
import { EmitKeys } from './keys'
import { State } from './models/StateModel'

/**
 * Sends a chat message
 * @param sender Socket or Server
 * @param data the message
 * @param from User sending message
 * @param broadcast Broadcast to all other clients
 */
export const sendMessage = (sender: Socket | Server, data: string, from?: string, broadcast = false) => {
  const s = (sender as any)
  if (broadcast && s.broadcast) {
    s.broadcast.emit(EmitKeys.NEW_MESSAGE, { from, data })
  } else {
    s.emit(EmitKeys.NEW_MESSAGE, { from, data })
  }
}

export const allReady = (state: State) => ([...state.UserMap.keys()].every(u => state.startVotes.has(u)))

export const startGame = (io: Server, state: State) => {
  let countdown = 5

  for (const user of state.UserMap.keys()) {
    state.startVotes.add(user)
  }

  sendMessage(io, 'Game is starting in: ', '<SERVER>')

  const interval = setInterval(() => {
    if (!allReady(state)) {
      clearInterval(interval)
      sendMessage(io, 'Users are not all ready', '<SERVER>')
      return
    }

    sendMessage(io, countdown.toString(), '<SERVER>')

    if (countdown === 0) {
      clearInterval(interval)
      state.started = true
      // start the game
      for (const user of state.UserMap.values()) {
        user.spawn()
      }

      io.emit('start_game', true)
      sendMessage(io, 'START', '<SERVER>')
    }

    countdown--
  }, 1000)
}
