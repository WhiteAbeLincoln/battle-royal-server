import { State, initialState } from './StateModel'
import { sendMessage } from '../helpers'
import { add, scale } from './utils'
import { bugger, SocketFunc } from '../index'
import { performance } from 'perf_hooks'
import { MessageKeys, EmitKeys } from '../keys'
import { Queue } from '../models/Queue'
import { bufferQueue } from '../functions/Action'

let quit = false
let present = performance.now()
let state = initialState
// this needs to be a copy of the queue not the same queue
let inputQueue: Queue<Action> = new Queue<Action>()

const UPDATE_RATE = 50 // dean says "don't update more than 20 seconds a second because this is javascript"

function processInput (elapsedTime: number) {
  // may need to make a copy of the input queue and then process that
  inputQueue._store = { ...bufferQueue._store }
  while (!inputQueue.isEmpty()) {
    // this is a big list of the inputs that need to be processed
    bugger(inputQueue.deQueue() + 'was processed')
    bufferQueue.deQueue()
  }
}

function updateState (currentTime: number, elapsedTime: number) {
  state.UserMap.forEach(element => {
    // bugger(element + ' as updated at ' + elapsedTime)
  })
  state.projectiles.forEach(element => {
    element.position = add(element.position, scale(element.weapon.speed, element.direction))
  })
}

function updateClients (elapsedTime: number) {
  state.UserMap.forEach(element => {
    // bugger('emmiting map to ' + element.token.gamertag)
    element.socket.emit(EmitKeys.UPDATE, state.map)
  })
}

function gameLoop (currentTime: number, elapsedTime: number) {
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

export interface Action {
  user: string
  action: string
}
