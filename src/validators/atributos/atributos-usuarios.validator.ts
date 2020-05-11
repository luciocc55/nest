import { IsNotEmpty, IsBoolean } from 'class-validator';

export class AtributosUsuarios {
  @IsNotEmpty({
    message: 'Valor es un campo requerido',
  })
  value: string;
  @IsNotEmpty({
    message: 'habilitado es un campo requerido',
  })
  @IsBoolean({
    message: 'habilitado debe ser un booleano',
  })
  habilitado: boolean;
  @IsNotEmpty({
    message: 'Id es un campo requerido',
  })
  _id: string;
}
