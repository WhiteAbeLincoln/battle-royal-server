import { WorldMap, Vec2 } from './World'

export interface User {
  token: { gamertag: string }
  spawn: Vec2
}

export type UserMap = Record<string, User>

export interface State {
  UserMap: UserMap
  map?: WorldMap
}

export const initialState = {
  UserMap: {}
}
