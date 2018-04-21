import { State, initialState } from './StateModel'
import { sendMessage } from '../helpers'
import { add, scale } from './utils'

let quit = false
let present = require('present')
let state = initialState

const UPDATE_RATE = 5000 // dean says "don't update more than 20 seconds a second because this is javascript"

function processInput (elapsedTime: number) {}

function updateState (currentTime: number, elapsedTime: number) {
  state.UserMap.forEach(element => {
    element.spawnPoint.y += 2
        // console.log(element + "'s position was updated to " + element.spawnPoint)
  })
  state.projectiles.forEach(element => {
    // element.position.x += element.position.x + element.direction.x
    // element.position.y += element.position.y + element.direction.y
    element.position = add(element.position, scale(element.weapon.speed, element.direction))
  })
}

function updateClients (elapsedTime: number) {}

function gameLoop (currentTime: number, elapsedTime: number) {
  processInput(elapsedTime)
  updateState(currentTime, elapsedTime)
  updateClients(elapsedTime)

  if (!quit) {
    setTimeout(() => {
      let now = present()
      gameLoop(now, now - currentTime)
    }, UPDATE_RATE)
  }
}

function init () {
  gameLoop(present, 0)
}
