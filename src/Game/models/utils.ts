import { Vec2 } from './World'

// given two vectors we want the projection of the first onto the second
function computeMagnitude (vector: Vec2): number {
  let mag: number = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y))
  return mag
}

function normalize (vector: Vec2): Vec2 {
  let magnitude: number = computeMagnitude(vector)
  let normalVector: Vec2 = { x: (vector.x / magnitude), y: (vector.y / magnitude) }
  return normalVector
}
function dotProduct (vector1: Vec2, vector2: Vec2): number {
  return (vector1.x * vector2.x + vector1.y * vector2.y)
}
function mutliply (vector1: Vec2, vector2: Vec2): Vec2 {
  let vectorProduct = { x: (vector1.x * vector2.x), y: (vector2.y * vector2.x) }
  return (vectorProduct)
}
export function scale (scale: number, vector: Vec2) {
  let scaledVector: Vec2 = { x: (vector.x + projectionX(vector).x), y: (vector.y + projectionY(vector).y) }
  return (scaledVector)
}
export function add (vector1: Vec2, vector2: Vec2): Vec2 {
  let vectorProduct = { x: (vector1.x + vector2.x), y: (vector2.y + vector2.x) }
  return (vectorProduct)
}
export function projection (vector1: Vec2, vector2: Vec2): Vec2 {
  let normalVector2: Vec2 = normalize(vector2)
  let projection: Vec2 = { x: (vector1.x * normalVector2.x), y: (vector1.y * normalVector2.y) }
  return projection
}
export function projectionX (vector1: Vec2): Vec2 {
  let xVector: Vec2 = { x: 1, y: 0 }
  return projection(vector1, xVector)
}
export function projectionY (vector1: Vec2): Vec2 {
  let yVector: Vec2 = { x: 0, y: 1 }
  return projection(vector1, yVector)
}
