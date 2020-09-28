import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/role/role.guard';
import { ExtrasService } from 'src/services/extras/extras.service';
import { SinonimosService } from 'src/services/sinonimos/sinonimos.service';

@Controller('extras')
@UseGuards(RolesGuard)
export class ExtrasControllerController {
  constructor(
    private extrasService: ExtrasService,
    private sinonimosService: SinonimosService
  ) {}
  @ApiTags('Lista los tipos de extras existentes')
  @Get('list')
  async listado(): Promise<any> {
    return await this.extrasService.find({});
  }
  @ApiTags('Lista los sinonimos existentes con la opcion de filtrar por tipo')
  @Get('sinonimos')
  async listarSinonimos(@Query() params): Promise<any> {
    const filter: any = {};
    if (params.tipo) {
      filter.tipo = params.tipo;
    }
    return await this.sinonimosService.find(filter);
  }
}
