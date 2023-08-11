import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isEmail,
} from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export default class CustomUsername implements ValidatorConstraintInterface {
  validate(text: string) {
    const isValidName = (arg) => /^[a-zA-Z0-9]{6,18}$/.test(arg);
    return isEmail(text) || isValidName(text);
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return '用户名不符合规范';
  }
}
