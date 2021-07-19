import { Injectable, HttpService } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { ErroresService } from "../errores/errores.service";
import { FunctionsService } from "../functions";

@Injectable()
export class AmrHttpService {
  url =
    "https://www.amr.org.ar/gestion/webServices/autorizador/v9/ambulatorio/";
  headers = { Authorization: "Basic  OTgwMTI6TllEVURIQ0s=" };
  constructor(
    private httpService: HttpService,
    private functionService: FunctionsService,
    private erroresService: ErroresService
  ) {}
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
                data.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
          try {
            if (
              data?.data.respuestaElegibilidadAfiliado?.estadoGeneral
                .tiposRespuestaValidacion !== "ERROR"
            ) {
              estatus = 1;
            } else {
              if (
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
                data?.data.respuestaElegibilidadAfiliado?.estadoGeneral.mensaje ===
                "timeout"
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
