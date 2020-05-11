import { IsNotEmpty, IsBoolean } from 'class-validator';

export class Permissions {
  @IsNotEmpty({
    message: 'Id es un campo requerido',
  })
  _id: string;
}
