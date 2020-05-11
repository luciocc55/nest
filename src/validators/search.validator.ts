import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class Search {
  search: string;
  @IsOptional()
  @IsInt({
    message: 'cantidad debe ser un entero',
  })
  cantidad: number = 50;
}

// tslint:disable-next-line: max-classes-per-file
export class Id {
  @IsNotEmpty({ message: 'Id es un campo requerido' })
  id: string;
}
