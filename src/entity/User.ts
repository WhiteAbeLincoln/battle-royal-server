import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'

export interface UserBase {
  name?: string
  gamertag: string
  creationDate: Date
}

@Entity()
export class User extends BaseEntity implements UserBase {

  setProperties (base: UserBase & { salt: string, password: string }) {
    this.name = base.name
    this.gamertag = base.gamertag
    this.creationDate = base.creationDate
    this.salt = base.salt
    this.password = base.password
  }

  toJSON () {
    return {
      name: this.name,
      gamertag: this.gamertag,
      creationDate: this.creationDate
    }
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column({
    default: 'Anonymous',
    nullable: true
  })
  name?: string

  @Column()
  password: string

  @Column()
  salt: string

  @Column({
    type: 'varying character',
    unique: true
  })
  gamertag: string

  @Column({
    type: 'datetime'
  })
  creationDate: Date
}
