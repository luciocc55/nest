import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FunctionsService } from '../functions';

@Injectable()
export class SwissMedicalHttpService {
  url = 'https://mobileint.swissmedical.com.ar/pre/api-smg/';
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
  constructor(private readonly httpService: HttpService, private functionService: FunctionsService) {}
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