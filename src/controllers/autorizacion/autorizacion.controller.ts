import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Token } from 'src/decorators/token.decorator';
import { RolesGuard } from 'src/guards/role/role.guard';
import { LoggingInterceptor } from 'src/interceptors/logger/logger.interceptor';
import { AtributosEstaticosService } from 'src/services/atributos-estaticos/atributos-estaticos.service';
import { AtributosUserService } from 'src/services/atributos-user/atributos-user.service';
import { AuthService } from 'src/services/auth/auth.service';
import { OrigenesService } from 'src/services/origenes/origenes.service';
import { SwissMedicalHttpService } from 'src/services/swiss-medical-http/swiss-medical-http.service';
import { UsersService } from 'src/services/users/users.service';
import { Autorizar } from 'src/validators/autorizacion/autorizaciones.validator';

@Controller('autorizacion')
@UseGuards(RolesGuard)
export class AutorizacionController {
    constructor(
      private swissService: SwissMedicalHttpService,
      private origenesService: OrigenesService,
      private authService: AuthService,
      private atribustoEstaticosService: AtributosEstaticosService,
      private usuariosService: UsersService,
      private atributosUserService: AtributosUserService,
    ) {}

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
        const validate = await this.origenesService.validateOrigenService(
          data.origen,
          path,
        );
        const [user, atributos, atributosEntradas] = await Promise.all([
          this.authService.getUser(token),
          this.atribustoEstaticosService.findEstaticosOrigen(path, data.origen),
          this.atribustoEstaticosService.findEstaticosOrigen(path, data.origen, true),
        ]);
        const usuario = await this.usuariosService.findById(user);
        const arrayValues = [];
        arrayValues.push(...await this.atributosUserService.getAtributosService(usuario, atributos));
        arrayValues.push(...await this.atributosUserService.getAtributosEntry(data.atributosAdicionales, atributosEntradas));
        arrayValues.push(data.prestaciones);
        arrayValues.push(data.fechaPrestacion);
        let autorizacion;
        switch (validate.description) {
          case 'Swiss Medical':
            autorizacion = await this.swissService.getAutorizacion(arrayValues);
        }
        return {autorizacion};
      }
}
