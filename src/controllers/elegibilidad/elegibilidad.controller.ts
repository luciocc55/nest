import {
  Controller,
  UseGuards,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { RolesGuard } from 'src/guards/role/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { Elegibilidad } from 'src/validators/eligibilidad/consultar-elegibilidad.validator';
import { Token } from 'src/decorators/token.decorator';
import { AuthService } from 'src/services/auth/auth.service';
import { AtributosEstaticosService } from 'src/services/atributos-estaticos/atributos-estaticos.service';
import { FunctionsService } from 'src/services/functions';
import { OrigenesService } from 'src/services/origenes/origenes.service';
import { AtributosUserService } from 'src/services/atributos-user/atributos-user.service';
import { PrestadoresService } from 'src/services/prestadores/prestadores.service';
import { UsersService } from 'src/services/users/users.service';
import { FederadaHttpService } from 'src/services/federada-http/federada-http.service';
import { EsencialHttpService } from 'src/services/esencial-http/esencial-http.service';
import { IaposHttpService } from 'src/services/iapos-http/iapos-http.service';
import { SwissMedicalHttpService } from 'src/services/swiss-medical-http/swiss-medical-http.service';
@Controller('elegibilidad')
@UseGuards(RolesGuard)
export class ElegibilidadController {
  constructor(
    private authService: AuthService,
    private atribustoEstaticosService: AtributosEstaticosService,
    private atributosUserService: AtributosUserService,
    private functionService: FunctionsService,
    private origenesService: OrigenesService,
    private prestadoresService: PrestadoresService,
    private usuariosService: UsersService,
    private federadaService: FederadaHttpService,
    private esencialService: EsencialHttpService,
    private iaposService: IaposHttpService,
    private swissService: SwissMedicalHttpService,
  ) {}
  @ApiTags(
    'Permite identificar si una persona tiene permitido',
    'Federada:Nro de Prestador Federada:Nro de Sub Prestador Federada',
    'Esencial:Codigo de Proveedor Esencial',
    'IAPOS',
    // 'Swiss Medical:Cuit Swiss Medical',
  )
  // , separa los origenes permitidos en el service
  // : separa los atributos necesarios para ese origen
  @Post('consultar')
  async list(@Body() data: Elegibilidad, @Token() token: string): Promise<any> {
    const path = '/autorizador/elegibilidad/consultar:post';
    const validate = await this.origenesService.validateOrigenService(
      data.origen,
      path,
    );
    const [user, atributos] = await Promise.all([
      this.authService.getUser(token),
      this.atribustoEstaticosService.findEstaticosOrigen(path, data.origen),
    ]);
    const usuario = await this.usuariosService.findById(user);
    const prestadores = await this.functionService.returnUniques(usuario['prestadores'], 'prestador');
    const arrayValues = [];
    for (const atributo of atributos) {
      const lista = this.functionService.returnUniques(
        atributo.atributos,
        '_id',
      );
      if (lista.length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Este atributo ' + atributo.description + ' no tiene ningun atributo asociado',
          },
          400,
        );
      }
      let value;
      let from = 'prestador';
      value = await this.prestadoresService.findOneSearchAtributos({atributo: lista , prestador: prestadores });
      if (!value) {
        value = await this.atributosUserService.findSearch({atributo: lista});
        from = 'usuario';
        if (!value) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Este atributo ' + value.atributo.description + ' no esta asociado al ' + from,
            },
            400,
          );
        }
      }
      if (!value.habilitado) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Este atributo ' + value.atributo.description + ' no esta habilitado para este ' + from,
          },
          400,
        );
      }
      if (!value.atributo.habilitado) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Este atributo ' + value.atributo.description + ' no esta habilitado',
          },
          400,
        );
      }
      arrayValues.push(value.value);
    }
    arrayValues.push(data.dni);
    arrayValues.push(data.afiliado);
    let elegibilidad;
    switch (validate.description) {
      case 'Federada':
        elegibilidad = await this.federadaService.getElegibilidad(arrayValues);
        break;
      // case 'Swiss Medical':
      //   elegibilidad = await this.swissService.getElegibilidad(arrayValues);
      //   break;
      case 'Esencial':
        elegibilidad = await this.esencialService.getElegibilidad(arrayValues);
        break;
      case 'IAPOS':
        elegibilidad = await this.iaposService.getElegibilidad(arrayValues);
        break;
    }
    return {elegibilidad};
  }
}
