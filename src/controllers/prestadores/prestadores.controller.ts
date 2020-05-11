import { Controller, UseGuards, Post, Body, UseInterceptors, Param, Get } from '@nestjs/common';
import { RolesGuard } from 'src/guards/role/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { Search } from 'src/validators/search.validator';
import { PrestadoresService } from 'src/services/prestadores/prestadores.service';
import { LoggingInterceptor } from 'src/interceptors/logger/logger.interceptor';
import { CreatePrestadorAtributos } from 'src/validators/prestadores/createPrestadorAtributos.validator';
import { UpdatePrestadores } from 'src/validators/prestadores/updatePrestador.validator';

@Controller('prestadores')
@UseGuards(RolesGuard)
export class PrestadoresController {
    constructor(private prestadoresService: PrestadoresService) {}
    @ApiTags('Lista los prestadores existentes')
    @Post('list')
    async list(@Body() search: Search): Promise<any> {
      return await this.prestadoresService.busPrestadores(search.search, search.cantidad);
    }
    @ApiTags('Crea un prestador')
    @UseInterceptors(LoggingInterceptor)
    @Post('create')
    async create(@Body() createdPrestador: CreatePrestadorAtributos): Promise<any> {
        const prestador = await this.prestadoresService.create(createdPrestador);
        const createdAtributos = await this.prestadoresService.addAtributos(prestador._id, createdPrestador.atributos);
        return createdAtributos;
    }

    @ApiTags('Actualiza los datos de un prestador')
    @UseInterceptors(LoggingInterceptor)
    @Post('update/:id')
    async update(@Body() updatePrestador: UpdatePrestadores, @Param() params): Promise<any> {
      const update = await this.prestadoresService.updatePrestador(params.id, updatePrestador);
      return update;
    }
    @ApiTags('Regresa los datos de un prestador')
    @Get('get/:id')
    async get( @Param() params): Promise<any> {
      return await this.prestadoresService.findByIdPopulated(params.id);
    }
}
