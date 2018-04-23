import { State, initialState } from './StateModel'
import { User } from './User'
import { sendMessage } from '../helpers'
import { add, scale } from './utils'
import { bugger, SocketFunc } from '../index'
import { performance } from 'perf_hooks'
import { MessageKeys, EmitKeys } from '../keys'
import { Queue } from '../models/Queue'
import { bufferQueue } from '../functions/Action'
import { rotateVec2, moveDirection } from '../math'

let quit = false
let present = performance.now()
let state = initialState
// this needs to be a copy of the queue not the same queue
let inputQueue: Queue<Action> = new Queue<Action>()

const UPDATE_RATE = 50 // dean says "don't update more than 20 seconds a second because this is javascript"

function processInput (elapsedTime: number) {
  // may need to make a copy of the input queue and then process that
  while (!bufferQueue.isEmpty()) {
    // this is a big list of the inputs that need to be processed There should be a way to deep copy them over but this works for now
    // TODO: deep copy instead of this BS
    let A1: Action | undefined = bufferQueue.deQueue()
    if (A1 !== undefined) {
      inputQueue.enQueue(A1)
    }
  }
  while (!inputQueue.isEmpty()) {
    let act: Action | undefined = inputQueue.deQueue()
    if (act === undefined) {
      bugger('stupid compiler you throw errors and then then don\'t throw them when you should')
    } else {
      // bugger('%s just tried to %s', act.user, act.action)
      let user: User | undefined = state.UserMap.get(act.user)
      if (user !== undefined) {
        // bugger('inputQueue update for %s and %s', act.user, act.action)
        switch (act.action) {
          case ('Fire'): {
            user.fire()
            // bugger('%s just fired', act.user)
            break
          }
          case ('TurnLeft'): {
            user.direction = rotateVec2(Math.PI / 6)(user.direction)
            // bugger('%s just turnedLeft', act.user)
            break
          }
          case ('TurnRight'): {
            user.direction = rotateVec2(- Math.PI / 6)(user.direction)
            // bugger('%s just turnedright', act.user)
            break
          }
          case ('MoveForward'): {
            user.position = moveDirection(user.direction)(user.position)(user.speed)
            // bugger('%s just movedforward', act.user)
            break
          }
          case ('MoveBackward'): {
            user.position = moveDirection(user.direction)(user.position)(-user.speed)
            // bugger('%s just movedBack', act.user)
            break
          }
        }
      }
    }
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
