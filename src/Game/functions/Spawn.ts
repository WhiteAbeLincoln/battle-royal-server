import { SocketFunc, bugger, Message } from '../index'
import { MessageKeys, EmitKeys } from '../keys'
import { Vec2, WorldMap, WorldObject } from '../models/World'
import { sendMessage } from '../helpers'

export const SetSpawn: SocketFunc = (socket, io) => (auth, state) => {
  // check to see if they can spawn there first don't want people spawining in a building
  socket.on(MessageKeys.SET_SPAWN_LOCATION, (msg: Vec2) => {
    bugger('%s set spawn location to %d, %d', auth.token.gamertag, msg.x, msg.y)
    const user = state.UserMap.get(auth.token.gamertag)
    if (!user) {
      throw new Error(`User ${auth.token.gamertag} not in UseMap`)
    }
    // check that there is not a building that they are trying to spawn into
    let canSpawnThere = true
    if (state.map) {
      for (let i = 0; i < state.map.objects.length; i++) {
        const building = state.map.objects[i]
        // check to see if it's a rectangle
        if (building.kind === 'rectangle') {
          // Lets see if point1.x < msg.x < point2.x and point1.y < msg.y < point2.y
          if (((building.point1.x < msg.x)
            && (building.point2.x > msg.x))
            && ((building.point1.y < msg.y)
            && (building.point2.y > msg.y))) {
            canSpawnThere = false
          }
        }
      }
    }

    if (canSpawnThere) {
      user.spawnPoint = msg

      io.emit(EmitKeys.NEW_SPAWN, { [auth.token.gamertag]: msg })
      sendMessage(io, `${auth.token.gamertag} set spawn to ${msg.x}, ${msg.y}`)
    } else {
      sendMessage(io, `${auth.token.gamertag} tried to set spawn to ${msg.x}, ${msg.y} but there's a building there`)
    }
  })
}
