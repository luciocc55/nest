import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class RediHttpService {
  url = 'https://demo.gored.com.ar/apiRest/';
  email = 'brunof@kozaca.com.ar';
  password = 'd@d*Z/Yp3k^a[K^2';
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async getSessionHeaders() {
    const token = await this.getToken();
    const headers = {
        Autorizacion: `Bearer ${token}`,
    };
    return headers;
  }

  getElegibilidadEsencial(arrayValues) {
    return this.getElegibilidad(arrayValues, '12');
  }
  getElegibilidadFederada(arrayValues) {
    return this.getElegibilidad(arrayValues, '10');
  }
  getElegibilidadGaleno(arrayValues) {
    return this.getElegibilidad(arrayValues, '6');
  }
  getElegibilidadOsseg(arrayValues) {
    return this.getElegibilidad(arrayValues, '7');
  }
  getElegibilidadOspe(arrayValues) {
    return this.getElegibilidad(arrayValues, '14');
  }
  getElegibilidadOsdop(arrayValues) {
    return this.getElegibilidad(arrayValues, '15');
  }
  getElegibilidadDemi(arrayValues) {
    return this.getElegibilidad(arrayValues, '18');
  }
  getElegibilidadProapro(arrayValues) {
    return this.getElegibilidad(arrayValues, '199');
  }
  getElegibilidad(arrayValues, os): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, os)).subscribe((data) => {
        let estatus;
        if (data.estado) {
          estatus = 1;
        } else {
          estatus = 0;
        }
        resolve({ data, estatus });
      });
    });
  }
  async elegibilidad(arrayValues, os): Promise<Observable<any>> {
    const headers = await this.getSessionHeaders();
    let msg;
    if (arrayValues[0]) {
      msg = {
        dni: arrayValues[0],
        os,
      };
    } else {
      msg = {
        nro_afiliado: arrayValues[1],
        os,
      };
    }
    return this.httpService
      .post(this.url + 'buscarAfiliado/', msg, { headers })
      .pipe(
        map((res) => res.data),
        catchError((e) => {
          return of({ e });
        }),
      );
  }
  getToken(): any {
    return new Promise(async (resolve) => {
      (await this.login()).subscribe((data) => {
        resolve(data);
      });
    });
  }
  async login(): Promise<Observable<any>> {
    return this.httpService
      .post(this.url + 'token/', {
        email: this.email,
        password: this.password,
      })
      .pipe(
        map((res) => res.data.token),
        catchError((e) => {
          return of({ e });
        }),
      );
  }
}
