import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DatosElegibilidad } from 'src/interfaces/datos-elegibilidad';
import { ErroresService } from '../errores/errores.service';
import { FunctionsService } from '../functions';

@Injectable()
export class AmrHttpService {
  url =
    'https://www.amr.org.ar/gestion/webServices/autorizador/v9/ambulatorio/';
  headers = { Authorization: 'Basic  OTgwMTI6TllEVURIQ0s=' };
  constructor(
    private httpService: HttpService,
    private functionService: FunctionsService,
    private erroresService: ErroresService,
  ) {}
  async elegibilidad(
    arrayValues,
    afiliado,
    codigoConvenio,
  ): Promise<Observable<any>> {
    const params: any = {};
    params.codigoProfesionEfector = arrayValues[1];
    params.matriculaEfector = arrayValues[0];
    params.libroEfector = '';
    params.folioEfector = '';
    params.codigoConvenio = codigoConvenio;
    params.codigoAfiliado = afiliado;
    const date = this.functionService.returnDateFormat2(new Date());
    params.fecha = date;
    params.codigoDelegacion = 1;
    return this.httpService
      .get(this.url + 'elegibilidad/afiliado', {
        headers: this.headers,
        params,
      })
      .pipe(
        map((res) => res.data),
        catchError((e) => {
          return of({ e });
        }),
      );
  }

  getElegibilidadIapos(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 1)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }
  getElegibilidadAmrSalud(arrayValues): any {
    const afiliado = arrayValues[2];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 2)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }

  getElegibilidadOspat(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 3)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }

  getElegibilidadCajaForense(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 4)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }

  getElegibilidadAca(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 5)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }
  getElegibilidadCienciasEco2(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 7)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }
  getElegibilidadSwiss(arrayValues): any {
    let afiliado = arrayValues[3];
    if (afiliado.startsWith('800006')) {
      afiliado = afiliado.replace('800006', '');
    }
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 8)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }
  getElegibilidadOsde(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 10)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }
  getElegibilidadUniversidad(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 11)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }

  getElegibilidadArqEIngen(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 22)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }
  getElegibilidadSmaiEpe(arrayValues): any {
    const afiliado = arrayValues[2];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 24)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }
  getElegibilidadPrevencion(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 41)).subscribe(async (data) => {
        let estatus = 0;
        let datosFinales: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (
            data.respuestaElegibilidadAfiliado.estadoGeneral
              .tiposRespuestaValidacion !== 'ERROR'
          ) {
            estatus = 1;
          } else {
            if (data.respuestaElegibilidadAfiliado.estadoGeneral
              .mensaje === 'timeout') {
              const err = await this.erroresService.findOne({
                valueStandard: 3
              });
              datosFinales.errorEstandarizado=err.description;
              datosFinales.errorEstandarizadoCodigo=err.valueStandard;
            }
          }
        } catch (error) {
          console.log(error);
        }
        resolve({ data, estatus, datosFinales });
      });
    });
  }
}
