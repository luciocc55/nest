import { IsNotEmpty } from 'class-validator';

export class CreateUsuarios {
  @IsNotEmpty({
    message: 'Email es un campo requerido',
  })
  email: string;
  @IsNotEmpty({
    message: 'User es un campo requerido',
  })
  user: string;
  @IsNotEmpty({
    message: 'Password es un campo requerido',
  })
  password: string;
}
