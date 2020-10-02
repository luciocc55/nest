import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DatosElegibilidad } from 'src/interfaces/datos-elegibilidad';
import { ErroresService } from '../errores/errores.service';
import { FunctionsService } from '../functions';

@Injectable()
export class SwissMedicalHttpService {
  url;
  urlPlat = 'V1.0/prestadores/hl7/';
  apiKey = '81ba7db467d68def9a81';
  usrLoginName = 'suap';
  password = 'suap2018';
  device = {
    messagingid: '132H12312',
    deviceid: '192.168.45.747',
    devicename: 'DELL-2Y0-DG',
    bloqueado: 0,
    recordar: 0,
  };
  constructor(private readonly httpService: HttpService, private functionService: FunctionsService, private erroresService: ErroresService) {
    if (process.env.Production === 'true') {
      this.url = 'https://mobile.swissmedical.com.ar/pre/api-smg/';
    } else {
      this.url = 'https://mobileint.swissmedical.com.ar/pre/api-smg/';
    }
  }
  async elegibilidad(arrayValues): Promise<Observable<any>> {
    const headers = await this.getSessionHeaders(arrayValues[0]);
    const date = this.functionService.returnDateFormat3(new Date());
    return this.httpService
      .post(
        this.url + this.urlPlat + 'elegibilidad/',
        {
          creden: arrayValues[2],
          alta: date,
          fecdif: date,
        },
        { headers },
      )
      .pipe(
        map((res) => res.data),
        catchError((e) => {
          return of({ e });
        }),
      );
  }
  getAutorizacion(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(arrayValues)).subscribe(async (data) => {
        let estatus;
        let resultados = [];
        let error;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        if (data.cabecera) {
          if (data.cabecera.rechaCabecera === 0) {
            estatus = 1;
            resultados = data.detalle.map((data, index) => {
              let estado;
              if (data.recha === 0) {
                estado = true;
              } else {
                estado = false;
              }
              return {prestación: arrayValues[4][index].codigoPrestacion, transaccion: data.transac, mensaje: data.denoItem, estado};
            });
          } else {
            const err = await this.erroresService.findOne({'values.value': data.cabecera.rechaCabecera.toString(), 'values.origen': origen});
            if (err) {
              errorEstandarizado = err.description;
              errorEstandarizadoCodigo = err.valueStandard;
            }
            estatus = 0;
            error = data.cabecera.rechaCabeDeno;
          }
        } else {
          estatus = 0;
          error = 'Por favor, intente nuevamente';
        }
        resolve({ data, resultado: {estatus, error, errorEstandarizado, errorEstandarizadoCodigo, resultados} });
      });
    });
  }
  async autorizacion(arrayValues): Promise<Observable<any>> {
    const headers = await this.getSessionHeaders(arrayValues[0]);
    const dateToday = this.functionService.returnDateFormat3(new Date());
    const date = this.functionService.returnDateFormatFrom(arrayValues[5]);
    const sumTotal = arrayValues[4].reduce((sum, current) => sum + current.cantidad, 0);
    const prestaciones = arrayValues[4].reduce((cont, current) => {
      let i = '';
      if (cont) {
        i = '|*';
      }
      return cont + i + current.codigoPrestacion + '*' + current.cantidad + '**';
    }, '');
    return this.httpService
      .post(
        this.url + this.urlPlat + 'registracion/',
        {
          creden: arrayValues[3]  + '|' + arrayValues[2] ,
          alta: dateToday,
          fecdif: date,
          manual: 0,
          ticketExt: 0,
          interNro: 2,
          autoriz: 0,
          rechaExt: 0,
          param1: sumTotal + '^*' + prestaciones,
          param2: null,
          param3: null,
          tipoEfector: 'CUIT',
          tipoPrescr: 'CUIT',
          idEfector: arrayValues[0],
          idPrescr: arrayValues[1] ? arrayValues[1] : null,
        },
        { headers },
      )
      .pipe(
        map((res) => res.data),
        catchError((e) => {
          return of({ e });
        }),
      );
  }

  async login(cuit): Promise<Observable<any>> {
    return this.httpService
      .post(this.url + 'v0/auth-login/', {
        apiKey: this.apiKey,
        cuit,
        usrLoginName: this.usrLoginName,
        password: this.password,
        device: this.device,
      })
      .pipe(
        map((res) => res.data.token),
        catchError((e) => {
          return of({ e });
        }),
      );
  }
  async getSessionHeaders(cuit) {
    const token = await this.getToken(cuit);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return headers;
  }
  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        let estatus;
        let datos: DatosElegibilidad;
        if (data.rechaCabecera === 0) {
          estatus = 1;
          datos = {
            nroAfiliado: arrayValues[3],
            nroDocumento: null,
            estadoAfiliado: data.rechaCabecera === 0 ? true : false,
            // tslint:disable-next-line: radix
            edad: parseInt(data.edad),
            voluntario: null,
            fechaNac: null,
            plan: data.planCodi,
            planDescripcion: '',
            genero: data.sexo === 'M' ? 'Masculino' : 'Femenino',
            codigoPostal: null,
            localidad: '',
            nombreApellido: data.apeNom,
            servicio: null,
            tipoDocumento: '',
            tipoDocumentoDescripcion: '',
            recupero: null,
          };
        } else {
          estatus = 0;
        }
        resolve({ data, estatus, datosFinales: datos });
      });
    });
  }
  getToken(cuit): any {
    return new Promise(async (resolve) => {
      (await this.login(cuit)).subscribe((data) => {
        resolve(data);
      });
    });
  }
}
