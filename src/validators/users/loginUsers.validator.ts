import { IsNotEmpty } from 'class-validator';

export class LoginUsers {
  @IsNotEmpty({
    message: 'User es un campo requerido',
  })
  user: string;
  @IsNotEmpty({
    message: 'Password es un campo requerido',
  })
  password: string;
}
