import { HttpService, Injectable } from "@nestjs/common";
import { of } from "rxjs";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
@Injectable()
export class AcindarHttpService {
  url;
  constructor(private readonly httpService: HttpService) {
    if (process.env.Production === "true") {
      this.url = "http://serviciosmacindar.online/api/";
    } else {
      this.url = "http://dev.serviciosmacindar.online/api/";
    }
  }

  getSessionHeaders(token: string) {
    const headers = {
      Authorization: token,
    };
    return headers;
  }

  async elegibilidad(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = this.getSessionHeaders(arrayValues[0]);
    const url = this.url + "Socios/Socio";
    const params = {
      NumeroSocio: arrayValues[2],
    };
    return this.httpService
      .get(url, {
        headers,
        params: params,
      })
      .pipe(
        map((res) => ({ data: res.data, params, url, headers, envio: {} })),
        catchError((e) => {
          return of({
            data: e,
            envio: {},
            params,
            headers: headers,
            url: url,
          });
        })
      );
  }
  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        let estatus;
        let dataHttp = data.data;
        let datos: DatosElegibilidad = new DatosElegibilidad();
        datos = {
          ...datos,
          nroAfiliado: dataHttp.NumeroSocio,
          estadoAfiliado: dataHttp.Habilitado,
          plan: dataHttp.CodigoPlan,
          planDescripcion: dataHttp.Plan,
          nombreApellido: dataHttp.NombreApellido,
        };
        let datosTasy: any = {
          "NroAfiliado" : dataHttp.NumeroSocio, 
          NombreApellido : dataHttp.NombreApellido,
          EstadoIntegrante : dataHttp.Habilitado? 'A': 'I',
        }
        if (dataHttp.Habilitado === true) {
          estatus = 1;
        } else {
          estatus = 0;
        }
        resolve({
          data: dataHttp,
          ...datosTasy,
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
