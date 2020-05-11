import { IsString } from 'class-validator';
export class BusPractica {
  @IsString({
    message: 'Practica debe ser un string',
  })
  practica: string;
}
