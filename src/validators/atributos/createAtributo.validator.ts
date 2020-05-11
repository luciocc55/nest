import { IsNotEmpty, IsOptional, IsBoolean, ValidateNested } from 'class-validator';

export class CreateAtributo {
  @IsNotEmpty({
    message: 'Descripcion es un campo requerido',
  })
  description: string;
  @IsOptional()
  @IsBoolean({message: 'habilitado es de tipo booleano'})
  habilitado: boolean = true;
  @IsOptional()
  @ValidateNested()
  atributosEstaticos: string[] = [];
}
