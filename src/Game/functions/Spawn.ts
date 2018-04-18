import { SocketFunc, bugger, Message } from '../index'
import { MessageKeys, EmitKeys } from '../keys'
import { Vec2 } from '../models/World'

export const SetSpawn: SocketFunc = (socket, io) => (auth, state) => {
  socket.on(MessageKeys.SET_SPAWN_LOCATION, (msg: Vec2) => {
    bugger('%s set spawn location to %d, %d', auth.token.gamertag, msg.x, msg.y)

    const user = state.UserMap.get(auth.token.gamertag)
    if (!user) {
      throw new Error(`User ${auth.token.gamertag} not in UserMap`)
    }

    user.spawnPoint = msg

    io.emit(EmitKeys.NEW_SPAWN, { [auth.token.gamertag]: msg })
    io.emit(EmitKeys.NEW_MESSAGE, ({ from: '<SERVER>', data: `${auth.token.gamertag} set spawn to ${msg.x}, ${msg.y}` }))
  })
}
