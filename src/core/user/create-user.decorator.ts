import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isEmail,
} from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export default class CustomUsername implements ValidatorConstraintInterface {
  validate(text: string) {
    const isValidName = (argument) => /^[\dA-Za-z]{6,18}$/.test(argument);
    return isEmail(text) || isValidName(text);
  }

  defaultMessage(arguments_: ValidationArguments) {
    // here you can provide default error message if validation failed
    return '用户名不符合规范';
  }
}
