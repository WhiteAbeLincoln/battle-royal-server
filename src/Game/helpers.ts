import { Socket, Server } from 'socket.io'
import { EmitKeys } from './keys'

/**
 * Sends a chat message
 * @param sender Socket or Server
 * @param data the message
 * @param from User sending message
 * @param broadcast Broadcast to all other clients
 */
export const sendMessage = (sender: Socket | Server, data: string, from?: string, broadcast = false) => {
  if (broadcast && (sender as any).broadcast) {
    (sender as Socket).broadcast.emit(EmitKeys.NEW_MESSAGE, { from, data })
  } else {
    (sender as any).emit(EmitKeys.NEW_MESSAGE, { from, data })
  }
}
