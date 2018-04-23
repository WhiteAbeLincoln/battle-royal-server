import { Area } from './State'
import { WorldObject } from './World'

export type WorldMap = {
  readonly kind: 'worldmap'
  readonly width: number,
  readonly height: number,
  readonly color: string,
  readonly objects: ReadonlyArray<WorldObject>
}
