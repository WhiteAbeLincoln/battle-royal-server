import { WorldMap, Vec2 } from './World'
import { Socket } from 'socket.io'
import Poll from './Poll'

type Gamertag = string

interface Weapon {
  firerate: number
  damage: number
  speed: number
}

export interface User {
  token: { gamertag: string }
  spawn: Vec2
  kickvotes: Set<string>
  socket: Socket
  position?: Vec2
  health: number
  inventory?: Weapon
  score: number
}

interface Projectile {
  direction: Vec2
  position: Vec2
  weapon: Weapon
  user: User
}

export interface State {
  UserMap: Map<Gamertag, User>
  map?: WorldMap
  polls: Map<string, Poll>
  projectiles: Projectile[]
}

export const initialState: State = {
  UserMap: new Map()
, polls: new Map()
, projectiles: []
}

export const newUser = (token: { gamertag: string }, socket: Socket): User => ({
  token
, spawn: { x: 0, y: 0 }
, kickvotes: new Set()
, socket
, health: 100
, score: 0
})
