import { SocketFunc, bugger, Message } from '../index'
import { MessageKeys, EmitKeys } from '../keys'

export const RecieveChat: SocketFunc = (socket, io) => (auth, state) => {
  socket.on(MessageKeys.CHAT, (message: Message<string>) => {
    bugger('Chat recieved from %s: %s', auth.token.gamertag, message.data)
    socket.broadcast.emit(EmitKeys.NEW_MESSAGE, ({ from: auth.token.gamertag, data: message.data }))
  })
}
