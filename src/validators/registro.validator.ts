
import { IsNotEmpty, IsString } from 'class-validator';

export class Registro {

  @IsString({
    message: 'Id debe ser un String',
  })
  @IsNotEmpty({
    message: 'Id es un campo requerido',
  })
  _id: string;

}
