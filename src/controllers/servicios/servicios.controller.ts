import { Controller, UseGuards, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "src/guards/role/role.guard";
import { ServiciosService } from "src/services/servicios/servicios.service";
@Controller("servicios")
@UseGuards(RolesGuard)
export class ServiciosController {
  constructor(private serviciosService: ServiciosService) {}
  @ApiTags("Lista los servicios existentes")
  @Get("list")
  async create(): Promise<any> {
    return await this.serviciosService.findAll({});
  }
}
