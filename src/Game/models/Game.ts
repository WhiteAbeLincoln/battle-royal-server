import { State, initialState } from './StateModel'
import { sendMessage } from '../helpers'
import { add, scale } from './utils'
import { bugger } from '../index'
import { performance } from 'perf_hooks';

let quit = false
let present = performance.now()
let state = initialState

const UPDATE_RATE = 50 // dean says "don't update more than 20 seconds a second because this is javascript"

function processInput (elapsedTime: number) {}

function updateState (currentTime: number, elapsedTime: number) {
  state.UserMap.forEach(element => {
    bugger(element + ' as updated at ' + elapsedTime)
  })
  state.projectiles.forEach(element => {
    element.position = add(element.position, scale(element.weapon.speed, element.direction))
  })
}

function updateClients (elapsedTime: number) {}

export function gameLoop (currentTime: number, elapsedTime: number) {
  processInput(elapsedTime)
  updateState(currentTime, elapsedTime)
  updateClients(elapsedTime)

  if (!quit) {
    setTimeout(() => {
      let now = performance.now()
      gameLoop(now, now - currentTime)
    }, UPDATE_RATE)
  }
}

export function init () {
  gameLoop(present, 0)

}
