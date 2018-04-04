import { ValidatorConstraint, ValidatorConstraintInterface,
         ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator'
import { User } from '../entity/User'

@ValidatorConstraint({ async: true })
export class NotExistingUserConstraint implements ValidatorConstraintInterface {

  async validate (gamertag: string, args: ValidationArguments) {
    const user = await User.findOne({ gamertag })
    if (user) return false
    return true
  }

}

export function IsNotExistingUser (validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NotExistingUserConstraint
    })
  }
}
