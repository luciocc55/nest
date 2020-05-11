import { IsOptional, IsBoolean, IsNotEmpty, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { AtributosUsuarios } from '../atributos/atributos-usuarios.validator';

export class UpdateUsers {
  @IsOptional()
  user: string;
  @IsOptional()
  password: string;
  @IsOptional()
  name: string;
  @IsOptional()
  lastName: string;
  @IsOptional()
  role: Types.ObjectId;
  @IsOptional()
  @ValidateNested()
  atributos: AtributosUsuarios[] = [];
  @IsOptional()
  @IsBoolean({message: 'Habilitado debe ser de tipo booleano'})
  habilitado: boolean;
}
