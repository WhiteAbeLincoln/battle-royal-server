import { WorldMap, Vec2 } from './World'
import { Socket } from 'socket.io'
import Poll from './Poll'

type Gamertag = string

export interface User {
  token: { gamertag: string }
  spawn: Vec2
  kickvotes: Set<string>
  socket: Socket
}

export interface State {
  UserMap: Map<Gamertag, User>
  map?: WorldMap
  polls: Map<string, Poll>
}

export const initialState: State = {
  UserMap: new Map()
, polls: new Map()
}

export const newUser = (token: { gamertag: string }, socket: Socket): User => ({
  token
, spawn: { x: 0, y: 0 }
, kickvotes: new Set()
, socket
})
