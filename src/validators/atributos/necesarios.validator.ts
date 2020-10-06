import { IsNotEmpty } from 'class-validator';

export class AtributosNecesarios {
  @IsNotEmpty({
    message: 'Origen es un campo requerido',
  })
  origen: string;
  @IsNotEmpty({
    message: 'isEntry es un campo requerido',
  })
  isEntry: string;
  @IsNotEmpty({
    message: 'Path es un campo requerido',
  })
  path: string;
}
