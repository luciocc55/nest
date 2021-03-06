import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Token } from "src/decorators/token.decorator";
import { RolesGuard } from "src/guards/role/role.guard";
import { LoggingInterceptor } from "src/interceptors/logger/logger.interceptor";
import { AcaHttpService } from "src/services/aca-http/aca-http.service";
import { AcindarHttpService } from "src/services/acindar-http/acindar-http.service";
import { ActiviaHttpService } from "src/services/activia-http/activia-http.service";
import { AmrHttpService } from "src/services/amr-http/amr-http.service";
import { AtributosEstaticosService } from "src/services/atributos-estaticos/atributos-estaticos.service";
import { AtributosUserService } from "src/services/atributos-user/atributos-user.service";
import { AuthService } from "src/services/auth/auth.service";
import { OrigenesService } from "src/services/origenes/origenes.service";
import { SwissMedicalHttpService } from "src/services/swiss-medical-http/swiss-medical-http.service";
import { TraditumHttpService } from "src/services/traditum-http/traditum-http.service";
import { UsersService } from "src/services/users/users.service";
import { Autorizar } from "src/validators/autorizacion/autorizaciones.validator";
import { CancelarAutorizacion } from "src/validators/autorizacion/cancelarAutorizacion.validator";
import { FederadaHttpService } from "src/services/federada-http/federada-http.service";
import { EsencialHttpService } from 'src/services/esencial-http/esencial-http.service';

@Controller("autorizacion")
@UseGuards(RolesGuard)
export class AutorizacionController {
  constructor(
    private swissService: SwissMedicalHttpService,
    private origenesService: OrigenesService,
    private authService: AuthService,
    private atribustoEstaticosService: AtributosEstaticosService,
    private usuariosService: UsersService,
    private atributosUserService: AtributosUserService,
    private activiaService: ActiviaHttpService,
    private acindarService: AcindarHttpService,
    private amrService: AmrHttpService,
    private acaSalud: AcaHttpService,
    private traditumService: TraditumHttpService,
    private federadaService: FederadaHttpService,
    private esencialService: EsencialHttpService,
  ) {}
  
  // las api_tags empiezan en arrayValues[3]
  @ApiTags(
    "Permite autorizar practicas contra los servicios habilitados",
    "Swiss Medical:Cuit Swiss Medical:Cuit de Prescriptor Swiss/true/true:Codigo de seguridad Swiss/true/true: Nro de afiliado Swiss/true:Codigo de Auditoria Swiss/true/true:Tipo de matricula Swiss/true/true:Profesion Swiss/true/true:Provincia Swiss/true/true:CUIT Efector/true/true",
    "OS Patrones de Cabotaje (Activia):Cuit Prestador OSPTC:Licencia Prestador:Nro de afiliado OSPTC/true",
    "Mutual Acindar:Token Acindar:Nro de afiliado Acindar/true",
    "AMR Salud:Matricula de Efector:Codigo de Profesion:Codigo afiliado AMR/true:Token AMR/true/true",
    "ACA Salud:Codigo de Prestador ACA Salud:Usuario ACA Salud:Password ACA Salud:Codigo afiliado ACA/true:Token ACA/true/true",
    "Federada:Cuit Prestador Federada:Cuit Efector Federada/true/true:Modo Federada/true/true:Tipo Doc Federada/true:Nro Doc Federada/true:Matricula Prescriptor Letra Federada/true/true:Fecha Prescripcion/true/true:Token Federada/true/true",
    "Galeno (Traditum):Sitio Emisor Galeno:Usuario Galeno:Password Galeno:Codigo de Provincia:Numero de Prestador:Tipo de identificador:Descripci??n de prestador:Codigo afiliado Galeno/true",
    'Esencial:Codigo de Proveedor Esencial:Codigo de prestador/true:Codigo de Socio + Credencial/true/true:Nro. de documento/true/true:Matricula de efector/true/true:Matricula de solicitante/true/true',
  )
  // , separa los origenes permitidos en el service
  // : separa los atributos necesarios para ese origen

  // / separa los atributos booleanos de la coleccion de atributos estaticos
  @UseInterceptors(LoggingInterceptor)
  @Post("autorizar")
  async list(
    @Body() data: Autorizar,
    @Token() token: string,
    @Param("IdTransaccion") IdTransaccion: string
  ): Promise<any> {
    const path = "/autorizador/autorizacion/autorizar:post";
    const validate = await this.origenesService.validateOrigenService(
      data.origen,
      path
    );
    const [user, atributos, atributosEntradas] = await Promise.all([
      this.authService.getUser(token),
      this.atribustoEstaticosService.findEstaticosOrigen(path, data.origen),
      this.atribustoEstaticosService.findEstaticosOrigen(
        path,
        data.origen,
        true
      ),
    ]);
    const usuario = await this.usuariosService.findById(user);
    const arrayValues = [];
    arrayValues.push(data.prestaciones);
    arrayValues.push(data.fechaPrestacion);
    arrayValues.push(data.matriculaProfesionalSolicitante);
    arrayValues.push(
      ...(await this.atributosUserService.getAtributosService(
        usuario,
        atributos
      ))
    );
    arrayValues.push(
      ...(await this.atributosUserService.getAtributosEntry(
        data.atributosAdicionales,
        atributosEntradas
      ))
    );
    arrayValues.push(data.diagnostico);
    let autorizacion;
    switch (validate.description) {
      case "Swiss Medical":
        autorizacion = await this.swissService.getAutorizacion(
          arrayValues,
          data.origen
        );
        break;
      case "OS Patrones de Cabotaje (Activia)":
        autorizacion = await this.activiaService.getAutorizacionOSPDC(
          arrayValues,
          data.origen
        );
        break;
      case "Mutual Acindar":
        autorizacion = await this.acindarService.getAutorizacion(
          arrayValues,
          data.origen
        );
        break;
      case "AMR Salud":
        autorizacion = await this.amrService.getAutorizacionAmrSalud(
          arrayValues,
          data.origen
        );
        break;
      case "ACA Salud":
        autorizacion = await this.acaSalud.getAutorizacion(
          arrayValues,
          data.origen
        );
        break;
      case "Galeno (Traditum)":
        autorizacion = await this.traditumService.returnXmlGalenoAutorizacion(
          arrayValues
        );
        break;
      case "Federada":
          autorizacion = await this.federadaService.getAutorizacion(
            arrayValues,
            data.origen
          );
          break;
      case 'Esencial':
          autorizacion = await this.esencialService.getAutorizacion(arrayValues, data.origen);
    }

    const autorizacionResp = { ...autorizacion, IdTransaccion };
    return {
      autorizacion: autorizacionResp,
      AutorizacionRespuesta: autorizacionResp,
    };
  }
  @ApiTags(
    "Permite cancelar autorizaciones de practicas contra los servicios habilitados",
    "Swiss Medical:Cuit Swiss Medical: Nro de afiliado Swiss/true",
    "OS Patrones de Cabotaje (Activia):Cuit Prestador OSPTC:Licencia Prestador",
    "Mutual Acindar:Token Acindar",
    "AMR Salud",
    "ACA Salud:Codigo de Prestador ACA Salud:Usuario ACA Salud:Password ACA Salud",
    "Federada:Cuit Prestador Federada:Cuit Efector Federada/true/true",
    "Galeno (Traditum):Sitio Emisor Galeno:Usuario Galeno:Password Galeno:Codigo de Provincia:Numero de Prestador:Tipo de identificador:Descripci??n de prestador:Codigo afiliado Galeno/true",
  )
  // , separa los origenes permitidos en el service
  // : separa los atributos necesarios para ese origen

  // / separa los atributos booleanos de la coleccion de atributos estaticos
  @UseInterceptors(LoggingInterceptor)
  @Post("cancelarAutorizacion")
  async cancelar(
    @Body() data: CancelarAutorizacion,
    @Token() token: string,
    @Param("IdTransaccion") IdTransaccion: string
  ): Promise<any> {
    const path = "/autorizador/autorizacion/cancelarAutorizacion:post";
    const validate = await this.origenesService.validateOrigenService(
      data.origen,
      path
    );
    const [user, atributos, atributosEntradas] = await Promise.all([
      this.authService.getUser(token),
      this.atribustoEstaticosService.findEstaticosOrigen(path, data.origen),
      this.atribustoEstaticosService.findEstaticosOrigen(
        path,
        data.origen,
        true
      ),
    ]);
    const usuario = await this.usuariosService.findById(user);
    const arrayValues = [];
    arrayValues.push(data.numeroTransaccion);
    arrayValues.push(
      ...(await this.atributosUserService.getAtributosService(
        usuario,
        atributos
      ))
    );
    arrayValues.push(
      ...(await this.atributosUserService.getAtributosEntry(
        data.atributosAdicionales,
        atributosEntradas
      ))
    );
    let cancelacion;
    switch (validate.description) {
      case "Swiss Medical":
        cancelacion = await this.swissService.getCancelarAutorizacion(
          arrayValues,
          data.origen
        );
        break;
      case "OS Patrones de Cabotaje (Activia)":
        cancelacion = await this.activiaService.getCancelarAutorizacionOSPDC(
          arrayValues,
          data.origen
        );
        break;

      case "Mutual Acindar":
        cancelacion = await this.acindarService.getCancelarAutorizacion(
          arrayValues
        );
        break;
      case "ACA Salud":
        cancelacion = await this.acaSalud.getCancelarAutorizacion(arrayValues);
        break;
      case "AMR Salud":
        cancelacion = await this.amrService.getCancelarAutorizacion(
          arrayValues
        );
        break;
        case "Federada":
          cancelacion = await this.federadaService.getCancelarAutorizacion(
            arrayValues,
            data.origen
          );
        break;
        case "Galeno (Traditum)":
          cancelacion = await this.traditumService.returnXmlGalenoCancelarAutorizacion(
            arrayValues,
          );
        break;
    }

    const cancelacionResp = { ...cancelacion, IdTransaccion };
    return {
      cancelacion: cancelacionResp,
      AutorizacionRespuesta: cancelacionResp,
    };
  }
}
