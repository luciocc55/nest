import { IsNotEmpty} from 'class-validator';

export class CreatePrestadores  {

  @IsNotEmpty({
    message: 'Nombre es un campo requerido',
  })
  name: string;
  @IsNotEmpty({
    message: 'Descripcion es un campo requerido',
  })
  description: string;
}
