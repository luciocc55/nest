import {
  Controller,
  UseGuards,
  UseInterceptors,
  Post,
  Body,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { LoggingInterceptor } from 'src/interceptors/logger/logger.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { Search } from 'src/validators/search.validator';
import { RolesGuard } from 'src/guards/role/role.guard';
import { CreateAtributo } from 'src/validators/atributos/createAtributo.validator';
import { AtributosService } from 'src/services/atributos/atributos.service';
import { AtributosEstaticosService } from 'src/services/atributos-estaticos/atributos-estaticos.service';
import { AtributosNecesarios } from 'src/validators/atributos/necesarios.validator';

@Controller('atributos')
@UseGuards(RolesGuard)
export class AtributosController {
  constructor(
    private atributosService: AtributosService,
    private atributosEstaticosService: AtributosEstaticosService,
  ) {}

  @ApiTags('Lista los atributos existentes')
  @Post('list')
  async list(@Body() search: Search): Promise<any> {
    return await this.atributosService.findAll(search.search);
  }
  @ApiTags('Lista los atributos estaticos existentes')
  @Post('estaticos/list')
  async listEstaticos(@Body() search: Search): Promise<any> {
    return await this.atributosEstaticosService.findAll(search.search);
  }
  @ApiTags('Devuelve detalles de un atributo')
  @Get('/:id')
  async getRole(@Param() params): Promise<any> {
    return await this.atributosService.findId(params.id);
  }
  @ApiTags('Crea un nuevo atributo')
  @UseInterceptors(LoggingInterceptor)
  @Post('create')
  async create(@Body() atributo: CreateAtributo): Promise<any> {
    return await this.atributosService.create(atributo);
  }
  @ApiTags('Modifica los datos de un atributo')
  @UseInterceptors(LoggingInterceptor)
  @Post('update/:id')
  async updateRole(
    @Param() params,
    @Body() atributo: CreateAtributo,
  ): Promise<any> {
    return await this.atributosService.update(params.id, atributo);
  }
  @ApiTags('Lista los atributos necesarios para consumir un service')
  @Get('consumir/necesarios')
  async necesarioAtr(@Query() params: AtributosNecesarios): Promise<any> {
    return await this.atributosEstaticosService.findAllSearch({
      'servicios.isEntry': params.isEntry.valueOf(),
      'servicios.path': params.path,
      'servicios.origen': params.origen,
    });
  }
}
