import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { AtributosUsuarios } from '../atributos/atributos-usuarios.validator';
import { CreatePrestadores } from './createPrestador.validator';

export class CreatePrestadorAtributos extends CreatePrestadores  {
  @IsOptional()
  @ValidateNested()
  atributos: AtributosUsuarios[] = [];
}
