import { IsNotEmpty } from "class-validator";

export class UsarServicio {
  @IsNotEmpty({
    message: "Servicio es un campo requerido (servicio)",
  })
  servicio: string;
  @IsNotEmpty({
    message: "Os es un campo requerido (os)",
  })
  os: string;
}
