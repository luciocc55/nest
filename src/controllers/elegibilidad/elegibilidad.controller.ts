import {
  Controller,
  UseGuards,
  Post,
  Body,
  UseInterceptors,
  Param,
} from "@nestjs/common";
import { RolesGuard } from "src/guards/role/role.guard";
import { ApiTags } from "@nestjs/swagger";
import { Elegibilidad } from "src/validators/eligibilidad/consultar-elegibilidad.validator";
import { Token } from "src/decorators/token.decorator";
import { AuthService } from "src/services/auth/auth.service";
import { AtributosEstaticosService } from "src/services/atributos-estaticos/atributos-estaticos.service";
import { OrigenesService } from "src/services/origenes/origenes.service";
import { AtributosUserService } from "src/services/atributos-user/atributos-user.service";
import { UsersService } from "src/services/users/users.service";
import { FederadaHttpService } from "src/services/federada-http/federada-http.service";
import { EsencialHttpService } from "src/services/esencial-http/esencial-http.service";
import { IaposHttpService } from "src/services/iapos-http/iapos-http.service";
import { SwissMedicalHttpService } from "src/services/swiss-medical-http/swiss-medical-http.service";
import { AmrHttpService } from "src/services/amr-http/amr-http.service";
import { RediHttpService } from "src/services/redi-http/redi-http.service";
import { LoggingInterceptor } from "src/interceptors/logger/logger.interceptor";
import { AcaHttpService } from "src/services/aca-http/aca-http.service";
import { TraditumHttpService } from "src/services/traditum-http/traditum-http.service";
import { ActiviaHttpService } from "src/services/activia-http/activia-http.service";
import { AcindarHttpService } from "src/services/acindar-http/acindar-http.service";
@Controller("elegibilidad")
@UseGuards(RolesGuard)
export class ElegibilidadController {
  constructor(
    private authService: AuthService,
    private atribustoEstaticosService: AtributosEstaticosService,
    private atributosUserService: AtributosUserService,
    private origenesService: OrigenesService,
    private usuariosService: UsersService,
    private federadaService: FederadaHttpService,
    private esencialService: EsencialHttpService,
    private iaposService: IaposHttpService,
    private swissService: SwissMedicalHttpService,
    private amrService: AmrHttpService,
    private redIService: RediHttpService,
    private acaService: AcaHttpService,
    private traditumService: TraditumHttpService,
    private activiaService: ActiviaHttpService,
    private acindarService: AcindarHttpService
  ) {}
  @ApiTags(
    "Permite identificar si una persona posee elegibilidad en un origen particular",
    "Federada:Nro de Prestador Federada:Nro de Sub Prestador Federada",
    "Esencial:Codigo de Proveedor Esencial",
    "ACA Salud:Codigo de Prestador ACA Salud",
    "IAPOS",
    "Swiss Medical (AMR):Matricula de Efector:Codigo de Profesion",
    "ACA Salud (AMR):Matricula de Efector:Codigo de Profesion",
    "IAPOS (AMR):Matricula de Efector:Codigo de Profesion",
    "AMR Salud:Matricula de Efector:Codigo de Profesion",
    "OSPAT (AMR):Matricula de Efector:Codigo de Profesion",
    "Ciencias Economicas CA II (AMR):Matricula de Efector:Codigo de Profesion",
    "Caja Forense (AMR):Matricula de Efector:Codigo de Profesion",
    "OSDE (AMR):Matricula de Efector:Codigo de Profesion",
    "Universidad (AMR):Matricula de Efector:Codigo de Profesion",
    "Arquitectura E Ingenieria Salud (AMR):Matricula de Efector:Codigo de Profesion",
    "SMAI - EPE (AMR):Matricula de Efector:Codigo de Profesion",
    "Prevencion Salud (AMR):Matricula de Efector:Codigo de Profesion",
    "Swiss Medical:Cuit Swiss Medical",
    "Esencial (Red-I)",
    "Federada Salud (Red-I)",
    "Galeno (Red-I)",
    "OSSEG (Red-I)",
    "OSPE (Red-I)",
    "OSDOP (Red-I)",
    "Demi Salud (Red-I)",
    "Proapro (Red-I)",
    "Medife (Traditum):Codigo de Provincia:Numero de Prestador:Tipo de identificador:Descripción de prestador",
    "OS Patrones de Cabotaje (Activia):Cuit Prestador OSPTC:Licencia Prestador",
    "Mutual Acindar:Token Acindar"
  )
  // , separa los origenes permitidos en el service
  // : separa los atributos necesarios para ese origen
  @UseInterceptors(LoggingInterceptor)
  @Post("consultar")
  async list(
    @Body() data: Elegibilidad,
    @Token() token: string,
    @Param("IdTransaccion") IdTransaccion: string
  ): Promise<any> {
    const path = "/autorizador/elegibilidad/consultar:post";
    const validate = await this.origenesService.validateOrigenService(
      data.origen,
      path
    );
    const [user, atributos] = await Promise.all([
      this.authService.getUser(token),
      this.atribustoEstaticosService.findEstaticosOrigen(path, data.origen),
    ]);
    const usuario = await this.usuariosService.findById(user);
    const arrayValues = await this.atributosUserService.getAtributosService(
      usuario,
      atributos
    );
    arrayValues.push(data.dni);
    arrayValues.push(data.afiliado);
    let elegibilidad;
    switch (validate.description) {
      case "Federada":
        elegibilidad = await this.federadaService.getElegibilidad(arrayValues);
        break;
      case "Swiss Medical":
        elegibilidad = await this.swissService.getElegibilidad(arrayValues);
        break;
      case "Esencial":
        elegibilidad = await this.esencialService.getElegibilidad(arrayValues);
        break;
      case "IAPOS":
        elegibilidad = await this.iaposService.getElegibilidad(arrayValues);
        break;
      case "Swiss Medical (AMR)":
        elegibilidad = await this.amrService.getElegibilidadSwiss(arrayValues);
        break;
      case "ACA Salud (AMR)":
        elegibilidad = await this.amrService.getElegibilidadAca(arrayValues);
        break;
      case "IAPOS (AMR)":
        elegibilidad = await this.amrService.getElegibilidadIapos(arrayValues);
        break;
      case "AMR Salud":
        elegibilidad = await this.amrService.getElegibilidadAmrSalud(
          arrayValues
        );
        break;
      case "OSPAT (AMR)":
        elegibilidad = await this.amrService.getElegibilidadOspat(arrayValues);
        break;
      case "Ciencias Economicas CA II (AMR)":
        elegibilidad = await this.amrService.getElegibilidadCienciasEco2(
          arrayValues
        );
        break;
      case "Caja Forense (AMR)":
        elegibilidad = await this.amrService.getElegibilidadCajaForense(
          arrayValues
        );
        break;
      case "OSDE (AMR)":
        elegibilidad = await this.amrService.getElegibilidadOsde(arrayValues);
        break;
      case "Universidad (AMR)":
        elegibilidad = await this.amrService.getElegibilidadUniversidad(
          arrayValues
        );
        break;
      case "Arquitectura E Ingenieria Salud (AMR)":
        elegibilidad = await this.amrService.getElegibilidadArqEIngen(
          arrayValues
        );
        break;
      case "SMAI - EPE (AMR)":
        elegibilidad = await this.amrService.getElegibilidadSmaiEpe(
          arrayValues
        );
        break;
      case "Prevencion Salud (AMR)":
        elegibilidad = await this.amrService.getElegibilidadPrevencion(
          arrayValues
        );
        break;

      case "Esencial (Red-I)":
        elegibilidad = await this.redIService.getElegibilidadEsencial(
          arrayValues
        );
        break;
      case "Federada Salud (Red-I)":
        elegibilidad = await this.redIService.getElegibilidadFederada(
          arrayValues
        );
        break;
      case "Galeno (Red-I)":
        elegibilidad = await this.redIService.getElegibilidadGaleno(
          arrayValues
        );
        break;
      case "OSSEG (Red-I)":
        elegibilidad = await this.redIService.getElegibilidadOsseg(arrayValues);
        break;
      case "OSPE (Red-I)":
        elegibilidad = await this.redIService.getElegibilidadOspe(arrayValues);
        break;
      case "OSDOP (Red-I)":
        elegibilidad = await this.redIService.getElegibilidadOsdop(arrayValues);
        break;
      case "Demi Salud (Red-I)":
        elegibilidad = await this.redIService.getElegibilidadDemi(arrayValues);
        break;
      case "Proapro (Red-I)":
        elegibilidad = await this.redIService.getElegibilidadProapro(
          arrayValues
        );
        break;
      case "ACA Salud":
        elegibilidad = await this.acaService.getElegibilidad(arrayValues);
        break;
      case "Medife (Traditum)":
        elegibilidad = await this.traditumService.returnXmlMedife(arrayValues);
        break;
      case "OS Patrones de Cabotaje (Activia)":
        elegibilidad = await this.activiaService.getElegibilidadOSPDC(
          arrayValues
        );
        break;

      case "Mutual Acindar":
        elegibilidad = await this.acindarService.getElegibilidad(arrayValues);
        break;
    }
    const elegibilidadResp = { ...elegibilidad, IdTransaccion };
    return {
      elegibilidad: elegibilidadResp,
      ElegibilidadRespuesta: elegibilidadResp,
    };
  }
}
