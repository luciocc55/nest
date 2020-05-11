import { IsNotEmpty, IsOptional, ValidateNested, IsNumber, IsInt, Min, Max } from 'class-validator';
import {Permissions} from './permissions.validator';
export class CreateRole {
  @IsNotEmpty({
    message: 'Descripcion es un campo requerido',
  })
  description: string;
  @IsInt()
  @Min(0)
  @Max(10)
  priority: number = 10;
  @IsOptional()
  @ValidateNested()
  permissions: Permissions[] = [];
}
