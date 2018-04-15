// tslint:disable:ter-indent

export interface Vec2 {
  x: number
  y: number
}

export interface Polygon {
  kind: 'polygon'
  color: string
  edges: Vec2[]
}

export interface Rectangle {
  kind: 'rectangle'
  color: string
  point1: Vec2
  point2: Vec2
}

export type WorldObject = Polygon | Rectangle

export interface WorldMap {
  width: number
  height: number
  color: string
  objects: WorldObject[]
}

export const generateMap = (): Promise<WorldMap> => Promise.resolve((
                                  { width: 1000 // game-unit meters
                                  , height: 1000
                                  , color: 'lightgreen'
                                  , objects:
                                    [ { kind: 'polygon'
                                      , color: 'green'
                                      , edges:
                                        [ { x: 100, y: 100 }
                                        , { x: 200, y: 100 }
                                        , { x: 200, y: 200 }
                                        , { x: 100, y: 100 }
                                        ]
                                      }
                                    , { kind: 'rectangle'
                                      , color: 'black'
                                      , point1: { x: 400, y: 400 }
                                      , point2: { x: 450, y: 450 }
                                      }
                                    ]
                                  } as WorldMap))
