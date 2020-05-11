import { IsNotEmpty, IsInt, IsBoolean, IsString } from 'class-validator';

export class Practicas {
  @IsString({
    message: 'Id debe ser un string',
  })
  @IsNotEmpty({
    message: 'id es un campo requerido',
  })
  // tslint:disable-next-line: ban-types
  _id: String;
  @IsInt({
    message: 'master debe ser un Int',
  })
  @IsNotEmpty({
    message: 'master es un campo requerido',
  })
  master: String;
  @IsBoolean({ message: 'unificado debe ser un Booleano' })
  @IsNotEmpty({
    message: 'unificado es un campo requerido',
  })
  unificado: Boolean;
  @IsBoolean({ message: 'eliminado debe ser un Booleano' })
  @IsNotEmpty({
    message: 'eliminado es un campo requerido',
  })
  eliminado: Boolean;
}
