import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoggingInterceptor } from 'src/interceptors/logger/logger.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { PracticasService } from './practicas.service';
import { RolesGuard } from 'src/guards/role/role.guard';
import { BusPractica } from 'src/validators/practicas/busPractica.validator';
import { IdPractica } from 'src/validators/practicas/practica.validator';
import { Practicas } from 'src/validators/practicas/practicas.validator';
import { BusPracticaId } from 'src/validators/practicas/practicasid.validator';
import { Registro } from 'src/validators/registro.validator';

@Controller('practicas/')
@UseGuards(RolesGuard)
export class PracticasController {
  constructor(private practicaService: PracticasService) {}
  @ApiTags('Devuelve una lista de 50 practicas')
  @Get('practicas')
  async get50() {
    return this.practicaService.getNumber(50);
  }
  @ApiTags('Devuelve una lista de como maximo 50 practicas dado un campo de busqueda')
  @Post('busqueda')
  async buspracticas(@Body() busquedapracticas: BusPractica) {
    return this.practicaService.busEquipos(
      busquedapracticas.practica,
    );
  }
  @ApiTags('Marca como eliminada una practica')
  @UseInterceptors(LoggingInterceptor)
  @Post('delete')
  async deletepracticas(@Body() registro: Registro) {
    return this.practicaService.deleteEquipo(registro._id);
  }
  @ApiTags('Crea un master de practicas nuevo con un codigo de Practica')
  @UseInterceptors(LoggingInterceptor)
  @Post('crearMaster')
  async crearMaster(@Body() Equipo: IdPractica) {
    return this.practicaService.createMaster(Equipo.idPractica);
  }
  @ApiTags('Actualiza el/los valores de un conjunto de practicas')
  @UseInterceptors(LoggingInterceptor)
  @Put('update')
  async updateEquip(@Body() practicas: Practicas[]) {
    practicas.forEach(async element => {
      await this.practicaService.updateEquip(element);
    });
    return { Proceso: 'practicas updateados' };
  }
  @ApiTags('Devuelve una lista de masters con las practicas asociadas a cada uno')
  @Post('matcheos')
  async busMasters(@Body() busquedapracticas: BusPractica) {
    return this.practicaService.busMasters(busquedapracticas.practica);
  }
  @ApiTags('Devuelve las practicas relacionados de un master dado')
  @Get('matcheos/:id')
  async busMaster(@Param() params) {
    return this.practicaService.busMaster(params.id);
  }
  @ApiTags('Agraga una nueva practica a un master')
  @UseInterceptors(LoggingInterceptor)
  @Post('matchear/:id')
  async addEquipIntoMaster(
    @Param() params,
    @Body() busquedapracticas: BusPracticaId,
  ) {
    return this.practicaService.addEquipIntoMaster(
      params.id,
      busquedapracticas.practica,
    );
  }
  @ApiTags('Elimina un equipo de un master')
  @UseInterceptors(LoggingInterceptor)
  @Get('deleteMerge/:id')
  async deleteEquipFromMaster(@Param() params) {
    return this.practicaService.deleteEquipFromMaster(params.id);
  }
  @ApiTags('Elimina un master y todos sus practicas relacionados (solo elimina las relaciones y actualiza sus banderas)')
  @UseInterceptors(LoggingInterceptor)
  @Get('deleteMaster/:id')
  async deleteMaster(@Param() params) {
    return this.practicaService.deleteMaster(params.id);
  }
}
