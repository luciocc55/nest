import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { AtributosUsuarios } from '../atributos/atributos-usuarios.validator';
import { CreateUsersAny } from './createUsersAny.validator';

export class CreateUsersAtributos extends CreateUsersAny {
  @IsOptional()
  @ValidateNested()
  atributos: AtributosUsuarios[] = [];
}
