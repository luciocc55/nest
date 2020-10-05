import { IsNotEmpty, IsArray } from 'class-validator';

export class CancelarAutorizacion {
  @IsNotEmpty({
    message: 'Origen es un campo requerido (origen)',
  })
  origen: string;
  @IsNotEmpty({
    message:
      'El numero de transaccion es un campo requerido (numeroTransaccion)',
  })
  numeroTransaccion: string;
  @IsArray()
  atributosAdicionales: [];
}
