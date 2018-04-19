// tslint:disable:ter-indent

var mapMaxX:number = 1000;
var mapMaxY:number = 1000;
var maxBuildingLength = 75;

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
// a function to generate the buildings on the map. Rightnow they are all rectangles and boring. 
function genBuildings(array: WorldObject[]): WorldObject[] {
  var i:number = 0;
  var count: number =100;
  
  for(i=0;i < count;i++) {
    //generate a random point in the graph
    var initPointx : number = Math.floor(Math.random() * Math.floor(mapMaxX-maxBuildingLength));
    var initPointy : number = Math.floor(Math.random()*Math.floor(mapMaxY-maxBuildingLength));
    // generate a random length and width between 0 and max building length
    var xlength : number = Math.floor(Math.random() * Math.floor(maxBuildingLength));
    var ylength : number = Math.floor(Math.random() * Math.floor(maxBuildingLength));
    array.push({
      kind: 'rectangle',
      color: 'black',
      point1: {x: initPointx, y: initPointy},
      point2: {x: initPointx + xlength, y: initPointy + ylength}
    });
  }
  console.log(array);
  return array;
}

export const generateMap = (): Promise<WorldMap> => Promise.resolve((
                                  { width: mapMaxX // game-unit meters
                                  , height: mapMaxY 
                                  , color: 'lightgreen'
                                  , objects: genBuildings([])
                                  } as WorldMap))
