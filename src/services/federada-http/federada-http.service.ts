import { Injectable, HttpService } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";

@Injectable()
export class FederadaHttpService {
  url = "https://api-test.federada.com/validador/v1.5.3/";
  constructor(private readonly httpService: HttpService) {}
  async elegibilidad(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = this.getSessionHeaders();
    const url = this.url + "wsvol000/";
    const body = {
      p_Prestador: arrayValues[0],
      p_SubPrestador: arrayValues[1],
      p_NroDoc: arrayValues[2],
    };
    return this.httpService.post(url, body, { headers }).pipe(
      map((res) => ({
        url: this.url,
        envio: body,
        params: {},
        headers: headers,
        data: res.data,
      })),
      catchError((e) => {
        return of({
          data: e,
          envio: body,
          params: {},
          headers: headers,
          url: url,
        });
      })
    );
  }

  getSessionHeaders() {
    const headers = {
      "x-api-key": `06xeXXOgiq3356caTOOdS4iruZMl0HD72CnYrUnD`,
    };
    return headers;
  }
  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        let estatus;
        let dataHttp = data.data;
        let datos: DatosElegibilidad = new DatosElegibilidad();
        if (dataHttp.o_Status === "SI") {
          estatus = 1;
          datos = {
            nroAfiliado: dataHttp.o_GruNro + "0" + dataHttp.o_IntNro,
            nroDocumento: dataHttp.o_NroDoc,
            estadoAfiliado: dataHttp.o_Status === "SI" ? true : false,
            // tslint:disable-next-line: radix
            edad: parseInt(dataHttp.o_Status),
            voluntario: dataHttp.o_SitFiscal === "O" ? true : false,
            fechaNac: dataHttp.o_FecNac,
            plan: dataHttp.o_PlanCod,
            planDescripcion: dataHttp.o_PlanDesc,
            genero: dataHttp.o_Sexo === "M" ? "Masculino" : "Femenino",
            codigoPostal: dataHttp.o_CodPos,
            localidad: dataHttp.o_DescLocali,
            nombreApellido: dataHttp.o_Apellido + "," + dataHttp.o_Nombres,
            servicio: dataHttp.o_Status === "SI" ? true : false,
            tipoDocumento: dataHttp.o_TipDoc,
            tipoDocumentoDescripcion: "",
            recupero: dataHttp.o_SitFiscal === "O" ? true : false,
          };
        } else {
          estatus = 0;
        }
        resolve({
          data: dataHttp,
          datosFinales: datos,
          estatus,
          envio: data.envio,
          params: data.params,
          url: data.url,
          headers: data.headers,
        });
      });
    });
  }
}
