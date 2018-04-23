import { WorldMap, Vec2 } from './World'
import { Socket } from 'socket.io'
import Poll from './Poll'
import { User } from './User'
import { ProjectileBase } from './Weapon'

type Gamertag = string

export interface State {
  UserMap: Map<Gamertag, User>
  map?: WorldMap
  polls: Map<string, Poll>
  projectiles: ProjectileBase[]
  startVotes: Set<Gamertag>
  started: boolean
}

export const initialState: State = {
  UserMap: new Map()
, polls: new Map()
, projectiles: []
, startVotes: new Set()
, started: false
}
