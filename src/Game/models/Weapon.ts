import { Vec2 } from './World'
import { UserBase } from './User'

export type Ammunition = 'bullet' | 'sniper_bullet' | 'rocket'

export abstract class ProjectileBase {
  abstract readonly id: Ammunition
  abstract name: string
  direction: Vec2
  position: Vec2

  constructor (public weapon: WeaponBase, public user: UserBase) {
    this.direction = { ...user.direction }
    this.position = { ...user.position }
  }
}

export class Bullet extends ProjectileBase {
  readonly id = 'bullet'
  name = 'Bullet'
}

export class SniperBullet extends ProjectileBase {
  readonly id = 'sniper_bullet'
  name = 'Sniper Bullet'
}

export class Rocket extends ProjectileBase {
  readonly id = 'rocket'
  name = 'Rocket'
}

export abstract class WeaponBase {
  readonly name: string = ''
  // in bullets/s
  firerate: number = 0
  damage: number = 0
  // in meters/s
  speed: number = 0
  readonly ammunition: Ammunition = 'bullet'

  abstract fire (user: UserBase): ProjectileBase
}

export class Gun extends WeaponBase {
  readonly name = 'Gun'
  firerate = 2
  damage = 5
  // this is the minimum listed by wikipedia under muzzle velocity
  speed = 120
  readonly ammunition = 'bullet'
  fire (user: UserBase): Bullet {
    return new Bullet(this, user)
  }
}

export class RocketLauncher extends WeaponBase {
  readonly name = 'Rocket Launcher'
  firerate = 0.5
  damage = 75
  speed = 10
  readonly ammunition = 'rocket'

  fire (user: UserBase): Rocket {
    return new Rocket(this, user)
  }
}

export class Sniper extends WeaponBase {
  readonly name = 'Sniper Rifle'
  // in bullets/s
  firerate = 0.75
  damage = 45
  // in meters/s
  speed = 400
  readonly ammunition = 'sniper_bullet'

  fire (user: UserBase): SniperBullet {
    return new SniperBullet(this, user)
  }
}
