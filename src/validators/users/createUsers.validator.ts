import { IsNotEmpty } from 'class-validator';
import { LoginUsers } from './loginUsers.validator';

export class CreateUsers extends LoginUsers {

  @IsNotEmpty({
    message: 'Nombre es un campo requerido',
  })
  name: string;
  @IsNotEmpty({
    message: 'Apellido es un campo requerido',
  })
  lastName: string;
}
