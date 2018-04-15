import { SocketFunc, bugger, Message } from '../index'
import { MessageKeys, EmitKeys } from '../keys'
import { Vec2 } from '../World'

export const SetSpawn: SocketFunc = (socket, io) => (auth, state) => {
  socket.on(MessageKeys.SET_SPAWN_LOCATION, (msg: Vec2) => {
    bugger('%s set spawn location to %d, %d', auth.token.gamertag, msg.x, msg.y)

    state.UserMap[auth.token.gamertag].spawn = msg

    io.emit(EmitKeys.NEW_SPAWN, { [auth.token.gamertag]: msg })
    io.emit(EmitKeys.NEW_MESSAGE, ({ from: '<SERVER>', data: `${auth.token.gamertag} set spawn to ${msg.x}, ${msg.y}` }))
  })
}
