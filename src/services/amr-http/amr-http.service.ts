import { Injectable, HttpService } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { ErroresService } from "../errores/errores.service";
import { FunctionsService } from "../functions";

@Injectable()
export class AmrHttpService {
  url;
  headers = { Authorization: "Basic  OTgwMTI6TllEVURIQ0s=" };
  constructor(
    private httpService: HttpService,
    private functionService: FunctionsService,
    private erroresService: ErroresService
  ) {
    if (process.env.Production === "true") {
      this.url =
        "https://www.amr.org.ar/gestion/webServices/autorizador/v10/ambulatorio/";
    } else {
      this.url =
        "https://www.amr.org.ar/gestion/webServices/autorizador/test/ambulatorio/";
    }
  }
  async autorizar(
    arrayValues,
    codigoConvenio
  ): Promise<Observable<RespuestaHttp>> {
    const date = this.functionService.returnDateFormat2(new Date());
    const url = this.url + "solicitar/autorizacion";
    const prestaciones = arrayValues[0].map((item) => ({
      codigoPrestacion: item.codigoPrestacion,
      cantidad: item.cantidad,
      bono: "321",
      solicitudAdicional: null,
    }));
    const body: any = {
      efector: { codigoProfesion: arrayValues[4], matricula: arrayValues[3], libro: " ", folio: " " },
      prescriptor: {
        codigoProfesion: arrayValues[2],
        matricula: arrayValues[0],
        libro: " ",
        folio: " ",
      },
      fechaPrestacion: date,
      codigoAfiliado: arrayValues[5],
      tokenAfiliado: arrayValues[6],
      codigoConvenio: codigoConvenio,
      codigoDelegacion: 1,
      codigoMedioDePago: 0,
      diagnostico: "",
      prestacionSolicitadas: prestaciones,
    };
    return this.httpService
      .post(url, body, {
        headers: this.headers,
      })
      .pipe(
        map((res) => ({
          data: res.data,
          params: {},
          url,
          headers: this.headers,
          envio: body,
        })),
        catchError((e) => {
          console.log(e)
          return of({
            data: e,
            envio: body,
            params: {},
            headers: this.headers,
            url: url,
          });
        })
      );
  }
  async elegibilidad(
    arrayValues,
    afiliado,
    codigoConvenio
  ): Promise<Observable<RespuestaHttp>> {
    const params: any = {};
    params.codigoProfesionEfector = arrayValues[1];
    params.matriculaEfector = arrayValues[0];
    params.libroEfector = "";
    params.folioEfector = "";
    params.codigoConvenio = codigoConvenio;
    params.codigoAfiliado = afiliado;
    const date = this.functionService.returnDateFormat2(new Date());
    params.fecha = date;
    params.codigoDelegacion = 1;
    const url = this.url + "elegibilidad/afiliado";
    return this.httpService
      .get(url, {
        headers: this.headers,
        params,
      })
      .pipe(
        map((res) => ({
          data: res.data,
          params,
          url,
          headers: this.headers,
          envio: {},
        })),
        catchError((e) => {
          return of({
            data: e,
            envio: {},
            params,
            headers: this.headers,
            url: url,
          });
        })
      );
  }

  getAutorizacionAmrSalud(arrayValues, origen): any {
    console.log(arrayValues)
    return new Promise(async (resolve) => {
      (await this.autorizar(arrayValues, 2)).subscribe(async (data) => {
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
  getElegibilidadIapos(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 1)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
  getElegibilidadAmrSalud(arrayValues): any {
    const afiliado = arrayValues[2];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 2)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          let datosTasy: any = {
            EstadoIntegrante: "I",
          };
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
              datosTasy.EstadoIntegrante = "A";
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                datosTasy.EstadoIntegrante = "E";
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
            datosTasy.EstadoIntegrante = "E";
          }
          resolve({
            ...datosTasy,
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }

  getElegibilidadOspat(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 3)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }

  getElegibilidadCajaForense(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 4)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }

  getElegibilidadAca(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 5)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
  getElegibilidadCienciasEco2(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 7)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
  getElegibilidadSwiss(arrayValues): any {
    let afiliado = arrayValues[3];
    if (afiliado.startsWith("800006")) {
      afiliado = afiliado.replace("800006", "");
    }
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 8)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
  getElegibilidadOsde(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 10)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
  getElegibilidadUniversidad(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 11)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }

  getElegibilidadArqEIngen(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 22)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
  getElegibilidadSmaiEpe(arrayValues): any {
    const afiliado = arrayValues[2];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 24)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
  getElegibilidadPrevencion(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 41)).subscribe(
        async (data) => {
          let estatus = 0;
          let datosFinales: DatosElegibilidad = new DatosElegibilidad();
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                  .mensaje === "timeout"
              ) {
                const err = await this.erroresService.findOne({
                  valueStandard: 3,
                });
                datosFinales.errorEstandarizado = err.description;
                datosFinales.errorEstandarizadoCodigo = err.valueStandard;
              }
            }
          } catch (error) {
            console.log(error);
          }
          resolve({
            data: data.data,
            datosFinales,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
}
