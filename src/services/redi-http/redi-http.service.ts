import { Injectable, HttpService } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { RespuestaHttp } from "src/interfaces/respuesta-http";

@Injectable()
export class RediHttpService {
  url = "https://demo.gored.com.ar/apiRest/";
  email = "brunof@kozaca.com.ar";
  password = "d@d*Z/Yp3k^a[K^2";
  constructor(private readonly httpService: HttpService) {}

  async getSessionHeaders() {
    const token = await this.getToken();
    const headers = {
      Autorizacion: `Bearer ${token}`,
    };
    return headers;
  }

  getElegibilidadEsencial(arrayValues) {
    return this.getElegibilidad(arrayValues, "12");
  }
  getElegibilidadFederada(arrayValues) {
    return this.getElegibilidad(arrayValues, "10");
  }
  getElegibilidadGaleno(arrayValues) {
    return this.getElegibilidad(arrayValues, "6");
  }
  getElegibilidadOsseg(arrayValues) {
    return this.getElegibilidad(arrayValues, "7");
  }
  getElegibilidadOspe(arrayValues) {
    return this.getElegibilidad(arrayValues, "14");
  }
  getElegibilidadOsdop(arrayValues) {
    return this.getElegibilidad(arrayValues, "15");
  }
  getElegibilidadDemi(arrayValues) {
    return this.getElegibilidad(arrayValues, "18");
  }
  getElegibilidadProapro(arrayValues) {
    return this.getElegibilidad(arrayValues, "199");
  }
  getElegibilidad(arrayValues, os): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, os)).subscribe((data) => {
        let estatus;
        if (data.data.estado) {
          estatus = 1;
        } else {
          estatus = 0;
        }
        resolve({
          data: data.data,
          estatus,
          envio: data.envio,
          params: data.params,
          url: data.url,
          headers: data.headers,
        });
      });
    });
  }
  async elegibilidad(arrayValues, os): Promise<Observable<RespuestaHttp>> {
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
    const url = this.url + "buscarAfiliado/";
    return this.httpService.post(url, msg, { headers }).pipe(
      map((res) => ({
        url: this.url,
        envio: msg,
        params: {},
        headers: headers,
        data: res.data,
      })),
      catchError((e) => {
        return of({
          data: e,
          envio: msg,
          params: {},
          headers: headers,
          url: url,
        });
      })
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
      .post(this.url + "token/", {
        email: this.email,
        password: this.password,
      })
      .pipe(
        map((res) => res.data.token),
        catchError((e) => {
          return of({ e });
        })
      );
  }
}
