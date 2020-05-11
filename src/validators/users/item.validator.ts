import { IsInt, IsNotEmpty } from 'class-validator';

export class Item {

  @IsInt({
    message: 'id debe ser un Int',
  })
  @IsNotEmpty({
    message: 'id es un campo requerido',
  })
  id: number;

}
