
import { SocketFunc, bugger, Message } from '../index'
import { MessageKeys, EmitKeys } from '../keys'
import { Queue } from '../models/Queue'
import { Action } from '../models/Game'

export const ReceiveAction: SocketFunc = (socket, io) => (auth, state) => {
  socket.on(MessageKeys.ACTION, (message: Message<string>) => {
    if (state.started) {
      bugger('ACTION recieved from %s: %s', auth.token.gamertag, message.data)
      bufferQueue.enQueue({ user: auth.token.gamertag, action: message.data })
    }
  })
}

export const bufferQueue: Queue<Action> = new Queue<Action>()
