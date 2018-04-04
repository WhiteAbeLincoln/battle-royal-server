import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { Exclude } from 'class-transformer'
import { IsNotExistingUser } from '../Validators/User'

export interface UserBase {
  name?: string
  gamertag: string
  creationDate: Date
}

@Entity()
export class User extends BaseEntity implements UserBase {

  constructor (base?: UserBase & { salt: string, password: string }) {
    super()

    if (base) {
      this.name = base.name
      this.gamertag = base.gamertag
      this.creationDate = base.creationDate
      this.salt = base.salt
      this.password = base.password
    }
  }

  toJSON () {
    return {
      name: this.name,
      gamertag: this.gamertag,
      creationDate: this.creationDate
    }
  }

  // tslint:disable:whitespace
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    default: 'Anonymous',
    nullable: true
  })
  name?: string

  @Exclude({ toPlainOnly: true })
  @Column()
  password!: string

  @Exclude({ toPlainOnly: true })
  @Column()
  salt!: string

  @Column({
    type: 'varying character',
    unique: true
  })
  gamertag!: string

  @Column({
    type: 'datetime'
  })
  creationDate!: Date
}
