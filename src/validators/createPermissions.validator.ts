import { IsNotEmpty } from 'class-validator';

export class CreatePermissions {
  @IsNotEmpty({
    message: 'Endpoint es un campo requerido',
  })
  endpoint: string;
  @IsNotEmpty({
    message: 'Descripcion es un campo requerido',
  })
  descripcion: string;
}
