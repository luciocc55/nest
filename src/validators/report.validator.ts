import { IsISO8601, IsOptional } from "class-validator";

export class GetReporte {
  @IsOptional()
  origen: string;
  @IsOptional()
  user: string;
  @IsOptional()
  url: string;
  @IsOptional()
  busqueda: string;
  @IsOptional()
  fechaHasta: string;
  @IsOptional()
  fechaDesde: string;
}
