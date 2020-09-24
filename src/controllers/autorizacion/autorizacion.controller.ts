import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Token } from 'src/decorators/token.decorator';
import { RolesGuard } from 'src/guards/role/role.guard';
import { LoggingInterceptor } from 'src/interceptors/logger/logger.interceptor';
import { Autorizar } from 'src/interfaces/autorizar';

@Controller('autorizacion')
@UseGuards(RolesGuard)
export class AutorizacionController {
    constructor() {}

    @ApiTags(
        'Permite autorizar practicas contra los servicios habilitados',
        'Swiss Medical:Cuit Swiss Medical:Matricula Swiss Medical:Matricula de Efector:Codigo de seguridad Swiss/true: Nro de afiliado Swiss/true',
      )
      // , separa los origenes permitidos en el service
      // : separa los atributos necesarios para ese origen

      // / separa los atributos del valor que indica si
      // son previamente seteados o se esperan en el body de entrada
      @UseInterceptors(LoggingInterceptor)
      @Post('autorizar')
      async list(@Body() data: Autorizar, @Token() token: string): Promise<any> {
        const path = '/autorizador/autorizacion/autorizar:post';

        const elegibilidad = '';

        return { elegibilidad };
      }
}
