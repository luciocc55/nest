import { HttpService, Injectable } from "@nestjs/common";
import { of } from "rxjs";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { ErroresService } from "../errores/errores.service";
@Injectable()
export class AcindarHttpService {
  url;
  constructor(
    private readonly httpService: HttpService,
    private erroresService: ErroresService
  ) {
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
  async autorizacion(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = this.getSessionHeaders(arrayValues[3]);
    const url = this.url + "prestadores/Autoriza";
    const prestaciones = arrayValues[0].map((item) => ({
      CodigoPractica: item.codigoPrestacion,
      Cantidad: item.cantidad,
    }));
    const body = {
      NumeroSocio: arrayValues[4],
      Practicas: prestaciones,
    };
    return this.httpService
      .post(url, body, {
        headers,
      })
      .pipe(
        map((res) => ({ data: res.data, params: {}, url, headers, envio: body })),
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
  async cancelarAutorizacion(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = this.getSessionHeaders(arrayValues[1]);
    const url = this.url + "prestadores/AnulaOrden";
    const params = {
      orden: arrayValues[0],
    };
    return this.httpService
      .delete(this.url, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => ({
          url: url,
          envio: {},
          params: params,
          headers: headers,
          data: res.data,
        })),
        catchError((e) => {
          return of({
            data: e,
            envio: {},
            params: params,
            headers: headers,
            url: url,
          });
        })
      );
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
            error: true
          });
        })
      );
  }
  getAutorizacion(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(arrayValues)).subscribe(async (data) => {
        let estatus;
        let resultados = [];
        let error;
        let numeroTransaccion = null;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        const dataHttp = data.data;
        let datosTasy: any = {
          Estado: false,
        };
        if (dataHttp) {
          if (dataHttp.Estado === 0) {
            estatus = 1;
            datosTasy.Estado = true;
            datosTasy.NroAtención = dataHttp.NumeroOrden;
            numeroTransaccion = dataHttp.NumeroOrden;
            resultados = arrayValues[0].map((item) => ({
              CodigoPractica: item.codigoPrestacion,
              Cantidad: item.cantidad,
              transaccion:  dataHttp.NumeroOrden,
              cantidad: item.cantidad,
              copago: dataHttp.ValorOrden,
              Copago: dataHttp.ValorOrden,
              Estado: estatus === 1? 'A': 'R',
              estado: estatus,
            }));
          } else {
            const err = await this.erroresService.findOne({
              "values.value": dataHttp?.Mensaje?.toString(),
              "values.origen": origen,
            });
            datosTasy.Error = 0;
            datosTasy.MotivoRechazo = dataHttp.Mensaje;
            if (err) {
              errorEstandarizado = err.description;
              errorEstandarizadoCodigo = err.valueStandard;
              datosTasy.Error = err.valueStandard;
              datosTasy.MotivoRechazo = err.description;
            }
            estatus = 0;
            error = dataHttp.Mensaje;
          }
        } else {
          estatus = 0;
          datosTasy.MotivoRechazo = "Por favor, intente nuevamente";
          error = "Por favor, intente nuevamente";
        }
        const datos = {
          estatus,
          error,
          errorEstandarizado,
          numeroTransaccion,
          errorEstandarizadoCodigo,
          resultados,
        };
        resolve({
          resultado: datos,
          datosFinales: datos,
          ...datosTasy,
          data: dataHttp,
          envio: data.envio,
          params: data.params,
          url: data.url,
          headers: data.headers,
        });
      });
    });
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
          NroAfiliado: dataHttp.NumeroSocio,
          NombreApellido: dataHttp.NombreApellido,
          EstadoIntegrante: dataHttp.Habilitado ? "A" : "I",
        };
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
  getCancelarAutorizacion(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.cancelarAutorizacion(arrayValues)).subscribe(async (data) => {
        let estatus;
        let error;
        let numeroTransaccion = null;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        let dataHttp = data.data;
        let datosTasy: any = {
          Estado: false,
        }
        if (!data['error']) {
          estatus = 1;
        } else {
          estatus = 0;
          datosTasy.MotivoRechazo = "Por favor, intente nuevamente";
          error = "Por favor, intente nuevamente";
        }
        resolve({
          data: dataHttp,
          envio: data.envio,
          params: data.params,
          url: data.url,
          headers: data.headers,
          ...datosTasy,
          resultado: {
            estatus,
            errorEstandarizado,
            numeroTransaccion,
            errorEstandarizadoCodigo,
            error,
          },
        });
      });
    });
  }
}
