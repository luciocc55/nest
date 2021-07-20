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
  @IsISO8601()
  fechaHasta: string;
  @IsOptional()
  @IsISO8601()
  fechaDesde: string;
}
