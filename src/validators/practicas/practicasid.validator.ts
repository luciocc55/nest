import { IsString } from 'class-validator';
export class BusPracticaId {
  @IsString({
    message: 'Practica debe ser un String',
  })
  practica: string;
}
