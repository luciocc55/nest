import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'AtLeast1', async: false })
export class AtLeast1 implements ValidatorConstraintInterface {

    validate(propertyValue: string, args: ValidationArguments) {
        return (!!propertyValue && !args.object[args.constraints[0]]) || (!propertyValue && !!args.object[args.constraints[0]]);
    }

    defaultMessage(args: ValidationArguments) {
      return `Se debe ingresar ${args.property} o ${args.constraints[0]}`;
    }
}
