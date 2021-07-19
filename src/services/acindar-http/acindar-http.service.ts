import { HttpService, Injectable } from "@nestjs/common";
import { of } from "rxjs";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
@Injectable()
export class AcindarHttpService {
  url;
  constructor(private readonly httpService: HttpService) {
    if (process.env.Production === "true") {
      this.url = "http://serviciosmacindar.online/api/";
    } else {
      this.url = "http://serviciosmacindar.online/api/";
    }
  }

  getSessionHeaders(token: string) {
    const headers = {
      Authorization: token,
    };
    return headers;
  }

  async elegibilidad(arrayValues): Promise<Observable<any>> {
    const headers = this.getSessionHeaders(arrayValues[0]);
    return this.httpService
      .get(this.url + "Socios/Socio", {
        headers,
        params: {
          NumeroSocio: arrayValues[2],
        },
      })
      .pipe(
        map((res) => res.data),
        catchError((e) => {
          return of({ e });
        })
      );
  }
  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        let estatus;
        let datos: DatosElegibilidad = new DatosElegibilidad();
        datos = {
          ...datos,
          nroAfiliado: data.NumeroSocio,
          estadoAfiliado: data.Habilitado,
          plan: data.CodigoPlan,
          planDescripcion: data.Plan,
          nombreApellido: data.NombreApellido,
        };
        if (data.Habilitado === true) {
          estatus = 1;
        } else {
          estatus = 0;
        }
        resolve({ data: data, estatus, datosFinales: datos });
      });
    });
  }
}
