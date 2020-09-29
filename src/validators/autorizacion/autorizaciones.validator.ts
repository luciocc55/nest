import { IsNotEmpty, IsBoolean, IsNumber, IsISO8601, IsArray, ValidateNested } from 'class-validator';

class Prestaciones {
  @IsNotEmpty({
    message: 'Codigo de la prestacion es un campo requerido (codigoPrestacion)',
  })
  codigoPrestacion: string;
  @IsNotEmpty({
    message: 'cantidad de la prestacion es un campo requerido (cantidad)',
  })
  @IsNumber()
  cantidad: number;
}
// tslint:disable-next-line: max-classes-per-file
export class Autorizar {
  @IsNotEmpty({
    message: 'Origen es un campo requerido (origen)',
  })
  origen: string;
  @ValidateNested({ each: true })
  @IsArray()
  prestaciones: Prestaciones[];
  @IsNotEmpty({
    message: 'Ambito de la prestacion es un campo requerido (ambitoPrestacion)',
  })
  ambitoPrestacion: string;
  @IsNotEmpty({
    message: 'Region de la prestacion es un campo requerido (region)',
  })
  region: string;
  @IsNotEmpty({
    message: 'Medio de pago de la prestacion es un campo requerido (medioPago)',
  })
  medioPago: string;
  @IsNotEmpty({
    message:
      'Profesional solicitante es un campo requerido (profesionalSolicitante)',
  })
  profesionalSolicitante: string;
  @IsNotEmpty({
    message:
      'Matricula del Profesional solicitante es un campo requerido (matriculaProfesionalSolicitante)',
  })
  matriculaProfesionalSolicitante: string;
  @IsNotEmpty({
    message: 'Diagnostico de la prestacion es un campo requerido (diagnostico)',
  })
  diagnostico: string;
  @IsNotEmpty({
    message:
      'Referencia de atencion de la prestacion es un campo requerido (referenciaAtencion)',
  })
  referenciaAtencion: string;
  @IsNotEmpty({
    message:
      'La fecha y hora del sistema "cliente" es un campo requerido (timeStampCliente)',
  })
  @IsISO8601()
  timeStampCliente: string;
  @IsNotEmpty({
    message:
      'La fecha de la prestacion es un campo requerido (fechaPrestacion)',
  })
  @IsISO8601()
  fechaPrestacion: string;
  @IsArray()
  atributosAdicionales: [];
}
