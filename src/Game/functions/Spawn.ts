import { SocketFunc, bugger, Message } from '../index'
import { MessageKeys, EmitKeys } from '../keys'
import { Vec2, WorldMap, WorldObject } from '../models/World'

export const SetSpawn: SocketFunc = (socket, io) => (auth, state) => {
  //check to see if they can spawn there first don't want people spawining in a building
  socket.on(MessageKeys.SET_SPAWN_LOCATION, (msg: Vec2) => {
    //Don't do this if the game has started
    if (!state.started) {
      // bugger('%s set spawn location to %d, %d', auth.token.gamertag, msg.x, msg.y)
      const user = state.UserMap.get(auth.token.gamertag)
      if (!user) {
        throw new Error(`User ${auth.token.gamertag} not in UseMap`)
      }
      // check that there is not a building that they are trying to spawn into
      var canSpawnThere : boolean = true;
      if(state.map){
        for (var i:number = 0; i< state.map.objects.length; i++){
          var building : WorldObject = state.map.objects[i];
          //check to see if it's a rectangle
          if (building.kind == 'rectangle'){
            //Le'ts see if point1.x < msg.x < point2.x and point1.y < msg.y < point2.y 
            if (((building.point1.x < msg.x) && (building.point2.x > msg.x)) && ((building.point1.y < msg.y) && (building.point2.y > msg.y))) {
              canSpawnThere = false;
            }
          }
        }
      }
      if (canSpawnThere) {
        user.spawnPoint = msg

        io.emit(EmitKeys.NEW_SPAWN, { [auth.token.gamertag]: msg })
        // io.emit(EmitKeys.NEW_MESSAGE, ({ from: '<SERVER>', data: `${auth.token.gamertag} set spawn to ${msg.x}, ${msg.y}` }))
      } else {
        io.emit(EmitKeys.NEW_MESSAGE, ({ from: '<SERVER>', data: `${auth.token.gamertag} tried to set spawn to ${msg.x}, ${msg.y} but there's a building there` }))
      }
    }
  })
}
