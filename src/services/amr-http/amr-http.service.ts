import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FunctionsService } from '../functions';

@Injectable()
export class AmrHttpService {
  url =
    'https://www.amr.org.ar/gestion/webServices/autorizador/v9/ambulatorio/';
  headers = { Authorization: 'Basic  OTgwMTI6TllEVURIQ0s=' };
  constructor(private httpService: HttpService, private functionService: FunctionsService) {}
  async elegibilidad(arrayValues, afiliado, codigoConvenio): Promise<Observable<any>> {
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
      .get(
        this.url + 'elegibilidad/afiliado',
        { headers: this.headers, params},
      )
      .pipe(
        map((res) => res.data),
        catchError((e) => {
          return of({ e });
        }),
      );
  }

  getElegibilidadSwiss(arrayValues): any {
    let afiliado = arrayValues[3];
    if (afiliado.startsWith('800006')) {
        afiliado = afiliado.replace('800006', '');
    }
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 8)).subscribe((data) => {
        let estatus = 0;
        try {
          if (data.respuestaElegibilidadAfiliado.estadoGeneral.tiposRespuestaValidacion !== 'ERROR') {
            estatus = 1;
          }
        } catch (error) {
          console.log(error)
        }
        resolve({ data, estatus });
      });
    });
  }

  getElegibilidadAca(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 5)).subscribe((data) => {
        let estatus = 0;
        try {
          if (data.respuestaElegibilidadAfiliado.estadoGeneral.tiposRespuestaValidacion !== 'ERROR') {
            estatus = 1;
          }
        } catch (error) {
          console.log(error)
        }
        resolve({ data, estatus });
      });
    });
  }

  getElegibilidadIapos(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 1)).subscribe((data) => {
        let estatus = 0;
        try {
          if (data.respuestaElegibilidadAfiliado.estadoGeneral.tiposRespuestaValidacion !== 'ERROR') {
            estatus = 1;
          }
        } catch (error) {
          console.log(error)
        }
        resolve({ data, estatus });
      });
    });
  }

  getElegibilidadAmrSalud(arrayValues): any {
    const afiliado = arrayValues[2];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 2)).subscribe((data) => {
        let estatus = 0;
        try {
          if (data.respuestaElegibilidadAfiliado.estadoGeneral.tiposRespuestaValidacion !== 'ERROR') {
            estatus = 1;
          }
        } catch (error) {
          console.log(error)
        }
        resolve({ data, estatus });
      });
    });
  }

  getElegibilidadOspat(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 3)).subscribe((data) => {
        let estatus = 0;
        try {
          if (data.respuestaElegibilidadAfiliado.estadoGeneral.tiposRespuestaValidacion !== 'ERROR') {
            estatus = 1;
          }
        } catch (error) {
          console.log(error)
        }
        resolve({ data, estatus });
      });
    });
  }

  getElegibilidadCajaForense(arrayValues): any {
    const afiliado = arrayValues[3];
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, afiliado, 4)).subscribe((data) => {
        let estatus = 0;
        try {
          if (data.respuestaElegibilidadAfiliado.estadoGeneral.tiposRespuestaValidacion !== 'ERROR') {
            estatus = 1;
          }
        } catch (error) {
          console.log(error)
        }
        resolve({ data, estatus });
      });
    });
  }

}
