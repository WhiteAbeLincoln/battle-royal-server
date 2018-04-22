import { Vec2 } from '../models//World'
import { Socket } from 'socket.io'
import { WeaponBase, Ammunition } from './Weapon'

type InventoryItem = WeaponBase

class Inventory {
  ammunition: Map<Ammunition, number>
  items: InventoryItem[]
  equipped?: InventoryItem

  constructor () {
    this.items = []
    this.ammunition = new Map()
  }

  hasAmmunition (w: WeaponBase) {
    const ammo = this.ammunition.get(w.ammunition)
    return !!ammo
  }
}

export class UserBase {
  private _spawnPoint: Vec2
  private _direction: Vec2
  private _position: Vec2
  private _health: number
  private _inventory: Inventory
  private _score: number

  constructor () {
    this._spawnPoint = { x: 0, y: 0 }
    this._direction = { x: 0, y: 0 }
    this._position = this._spawnPoint
    this._health = 100
    this._score = 0
    this._inventory = new Inventory()
  }

  set spawnPoint (v: Vec2) { this._spawnPoint = v }
  get spawnPoint () { return this._spawnPoint }

  set position (v: Vec2) { this._position = v }
  get position () { return this._position }

  set health (h: number) { this._health = h }
  get health () { return this._health }

  set score (n: number) { this._score = n }
  get score () { return this._score }

  set direction (n: Vec2) { this._direction = n }
  get direction () { return this._direction }

  get inventory () { return this._inventory }

  spawn () {
    this.position = { ...this.spawnPoint }
  }

  fire () {
    const equipped = this.inventory.equipped
    if (equipped && equipped instanceof WeaponBase && this.inventory.hasAmmunition(equipped)) {
      return equipped.fire(this)
    }
  }
}

export class User extends UserBase {
  kickvotes: Set<string>

  constructor (public token: { gamertag: string }, public socket: Socket) {
    super()
    this.kickvotes = new Set()
  }
}

export class Bot extends UserBase {

}

/*
TODO: Implement Bots

export class Bot implements UserBase {
  token: { gamertag: string; }
  spawn: Vec2
  kickvotes: Set<string>
  socket: Socket
  position?: Vec2 | undefined
  health: number
  inventory?: WeaponBase | undefined
  score: number
}
*/
