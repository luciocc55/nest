import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
  constructor(private readonly httpService: HttpService, private functionService: FunctionsService) {
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
  getAutorizacion(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(arrayValues)).subscribe((data) => {
        let estatus;
        if (data.cabecera?.rechaCabecera === 0) {
          estatus = 1;
        } else {
          estatus = 0;
        }
        resolve({ data, estatus });
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
          idPrescr: arrayValues[1],
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
        if (data.rechaCabecera === 0) {
          estatus = 1;
        } else {
          estatus = 0;
        }
        resolve({ data, estatus });
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
