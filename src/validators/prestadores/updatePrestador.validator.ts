import { IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';
import { AtributosUsuarios } from '../atributos/atributos-usuarios.validator';

export class UpdatePrestadores {
  @IsOptional()
  @IsNotEmpty({
    message: 'Nombre es un campo requerido',
  })
  name: string;
  @IsOptional()
  @IsNotEmpty({
    message: 'Descripcion es un campo requerido',
  })
  description: string;
  @IsOptional()
  @ValidateNested()
  atributos: AtributosUsuarios[] = [];
}
