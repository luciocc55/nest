import { IsNotEmpty, IsString } from 'class-validator';

export class IdPractica {
    @IsString({
      message: 'idPractica debe ser un String',
    })
    @IsNotEmpty({
      message: 'idPractica es un campo requerido',
    })
    // tslint:disable-next-line: ban-types
    idPractica: string;
  }
