import { Injectable, HttpService } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
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
        let datos: DatosElegibilidad = new DatosElegibilidad();
        let datosTasy: any = {
          "MotivoRechazo" : "",
          EstadoIntegrante : 'I'
        }
        if (data.data.estado) {
          const datosService = data.data.resultados;
          datos = {
            nroAfiliado: datosService.nro_afiliado,
            nroDocumento: datosService.nro_identif,
            estadoAfiliado: datosService.estado,
            // tslint:disable-next-line: radix
            edad: null,
            voluntario: datosService.condicion_iva === "GRAVADO" ? true : false,
            fechaNac: datosService.f_nacimiento,
            plan: datosService.plan_nombre,
            planDescripcion: datosService.plan_nombre,
            genero: datosService.genero === "M" ? "Masculino" : "Femenino",
            codigoPostal: datosService.cod_postal,
            localidad: datosService.localidad,
            nombreApellido: datosService.nombre,
            servicio: null,
            tipoDocumento: datosService.tipo_doc,
            tipoDocumentoDescripcion: "",
            recupero: datosService.recupero === 1 ? true : false,
          };
          datosTasy.NombreApellido = datosService.nombre;
          estatus = 1;
          datosTasy.EstadoIntegrante = 'A'
        } else {
          estatus = 0;
        }
        resolve({
          data: data.data,
          ...datosTasy,
          datosFinales: datos,
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
