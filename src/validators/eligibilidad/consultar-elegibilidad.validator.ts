import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { AtLeast1 } from './custom-validator.class';

export class Elegibilidad {
  @IsNotEmpty({
    message: 'origen es un campo requerido',
  })
  origen: string;
  @IsOptional()
  @Validate(AtLeast1, ['afiliado'])
  dni: string = '';
  @IsOptional()
  @Validate(AtLeast1, ['dni'])
  afiliado: string = '';

}
