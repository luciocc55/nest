import {
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from "class-validator";
class Definiciones {
  @IsNotEmpty({
    message: "Valor de entrada es un campo requerido (valorEntrada)",
  })
  valorEntrada: string;
  @IsNotEmpty({
    message: "Valor de salida es un campo requerido (valorSalida)",
  })
  valorSalida: string;
}
class Keys {
  @IsNotEmpty({
    message: "Key es un campo requerido (key)",
  })
  key: string;
  @IsNotEmpty({
    message: "Key de Relacion es un campo requerido (keyRelacionada)",
  })
  keyRelacionada: string;
  @ValidateNested({ each: true })
  @IsArray()
  definiciones: Definiciones[];
}
export class CrearEsquema {
  @IsNotEmpty({
    message: "Origen es un campo requerido (origen)",
  })
  origen: string;
  @IsNotEmpty({
    message: "JSON es un campo requerido (json)",
  })
  json: string;
  @IsNotEmpty({
    message: "Servicio es un campo requerido (servicio)",
  })
  servicio: string;
  @ValidateNested({ each: true })
  @IsArray()
  keys: Keys[];
}
