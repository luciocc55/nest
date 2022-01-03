import { Injectable, HttpService } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { ErroresService } from "../errores/errores.service";
import { FunctionsService } from "../functions";

@Injectable()
export class SwissMedicalHttpService {
  url;
  urlPlat = "V1.0/prestadores/hl7/";
  apiKey = "81ba7db467d68def9a81";
  usrLoginName = "suap";
  password = "suap2018";
  urlPlatV11 = "V1.1/prestadores/hl7/";
  device = {
    messagingid: "132H12312",
    deviceid: "192.168.45.747",
    devicename: "DELL-2Y0-DG",
    bloqueado: 0,
    recordar: 0,
  };
  constructor(
    private readonly httpService: HttpService,
    private functionService: FunctionsService,
    private erroresService: ErroresService
  ) {
    if (process.env.Production === "true") {
      this.url = "https://mobile.swissmedical.com.ar/pre/api-smg/";
    } else {
      this.url = "https://mobileint.swissmedical.com.ar/pre/api-smg/";
    }
  }
  async elegibilidad(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders(arrayValues[0]);
    const date = this.functionService.returnDateFormat3(new Date());
    const url = this.url + this.urlPlat + "elegibilidad/";
    const body = {
      creden: arrayValues[2],
      alta: date,
      fecdif: date,
    };
    return this.httpService.post(url, body, { headers }).pipe(
      map((res) => ({
        url: url,
        envio: body,
        params: {},
        headers: headers,
        data: res.data,
      })),
      catchError((e) => {
        return of({
          data: e,
          envio: body,
          params: {},
          headers: headers,
          url: url,
        });
      })
    );
  }
  getCancelarAutorizacion(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.cancelarAutorizacion(arrayValues)).subscribe(async (data) => {
        let estatus;
        let error;
        let numeroTransaccion = null;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        let dataHttp = data.data;
        let datosTasy: any = {
          Estado: false,
        }
        if (dataHttp.cabecera) {
          if (dataHttp.cabecera.rechaCabecera === 0) {
            estatus = 1;
            numeroTransaccion = dataHttp.cabecera.transac;
            datosTasy.NroAtención = dataHttp.cabecera.transac;
            datosTasy.Estado = true;
          } else {
            const err = await this.erroresService.findOne({
              "values.value": dataHttp.cabecera.rechaCabecera.toString(),
              "values.origen": origen,
            });
            datosTasy.MotivoRechazo = dataHttp.cabecera.rechaCabeDeno;
            if (err) {
              datosTasy.MotivoRechazo = err.description;
              errorEstandarizado = err.description;
              errorEstandarizadoCodigo = err.valueStandard;
            }
            estatus = 0;
            error = dataHttp.cabecera.rechaCabeDeno;
          }
        } else {
          estatus = 0;
          datosTasy.MotivoRechazo = "Por favor, intente nuevamente";
          error = "Por favor, intente nuevamente";
        }

        resolve({
          data: dataHttp,
          envio: data.envio,
          params: data.params,
          url: data.url,
          headers: data.headers,
          ...datosTasy,
          resultado: {
            estatus,
            errorEstandarizado,
            numeroTransaccion,
            errorEstandarizadoCodigo,
            error,
          },
        });
      });
    });
  }
  async cancelarAutorizacion(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders(arrayValues[1]);
    const dateToday = this.functionService.returnDateFormat3(new Date());
    const url = this.url + this.urlPlatV11 + "cancela-prestacion/";
    const body = {
      creden: arrayValues[2],
      alta: dateToday,
      ticketExt: arrayValues[0],
      param1: "0",
    };
    return this.httpService.post(url, body, { headers }).pipe(
      map((res) => ({
        url: url,
        envio: body,
        params: {},
        headers: headers,
        data: res.data,
      })),
      catchError((e) => {
        return of({
          data: e,
          envio: body,
          params: {},
          headers: headers,
          url: url,
        });
      })
    );
  }
  getAutorizacion(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(arrayValues)).subscribe(async (data) => {
        let estatus;
        let resultados = [];
        let error;
        let numeroTransaccion = null;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        const dataHttp = data.data;
        let datosTasy: any = {
          Estado: false
        }
        if (dataHttp.cabecera) {
          if (dataHttp.cabecera.rechaCabecera === 0) {
            estatus = 1;
            datosTasy.Estado = true;
            resultados = dataHttp.detalle.map((data, index) => {
              let estado;
              if (data.recha === 0) {
                estado = true;
              } else {
                estado = false;
              }
              return {
                prestación: arrayValues[0][index].codigoPrestacion,
                CodigoPrestacion:arrayValues[0][index].codigoPrestacion,
                transaccion: data.transac,
                mensaje: data.denoItem,
                cantidad: data.canti,
                Cantidad: data.canti,
                Rechazadas: data.recha,
                rechazadas: data.recha,
                copago: data.valorCopa,
                Copago: data.valorCopa,
                Estado: estado? 'A': 'R',
                estado,
              };
            });
            datosTasy.Prestaciones = resultados;
            datosTasy.NroAtención = dataHttp.cabecera.transac;
            numeroTransaccion = dataHttp.cabecera.transac;
          } else {
            const err = await this.erroresService.findOne({
              "values.value": dataHttp.cabecera.rechaCabecera.toString(),
              "values.origen": origen,
            });
            datosTasy.Error = 0;
            datosTasy.MotivoRechazo = dataHttp.cabecera.rechaCabeDeno;
            if (err) {
              errorEstandarizado = err.description;
              errorEstandarizadoCodigo = err.valueStandard;
              datosTasy.Error = err.valueStandard;
              datosTasy.MotivoRechazo =  err.description;
            }
            estatus = 0;
            error = dataHttp.cabecera.rechaCabeDeno;
          }
        } else {
          estatus = 0;
          datosTasy.MotivoRechazo = "Por favor, intente nuevamente";
          error = "Por favor, intente nuevamente";
        }
        const datos = {
          estatus,
          error,
          errorEstandarizado,
          numeroTransaccion,
          errorEstandarizadoCodigo,
          resultados,
        };
        resolve({
          resultado: datos,
          datosFinales: datos,
          ...datosTasy,
          data: dataHttp,
          envio: data.envio,
          params: data.params,
          url: data.url,
          headers: data.headers,
        });
      });
    });
  }
  async autorizacion(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders(arrayValues[3]);
    const dateToday = this.functionService.returnDateFormat3(new Date());
    const date = this.functionService.returnDateFormatFrom(arrayValues[1]);
    const sumTotal = arrayValues[0].reduce(
      (sum, current) => sum + current.cantidad,
      0
    );
    const prestaciones = arrayValues[0].reduce((cont, current) => {
      let i = "";
      if (cont) {
        i = "|*";
      }
      return (
        cont + i + current.codigoPrestacion + "*" + current.cantidad + "**"
      );
    }, "");
    const body = {
      creden: arrayValues[6] + "|" + arrayValues[5],
      alta: dateToday,
      fecdif: date,
      manual: "0",
      ticketExt: 0,
      interNro: 2,
      autoriz: arrayValues[7] ? parseInt(arrayValues[7]) : 0,
      rechaExt: 0,
      param1: sumTotal + "^*" + prestaciones,
      param2: "",
      param3: "",
      tipoEfector: "CUIT",
      tipoPrescr: arrayValues[2]
        ? arrayValues[8] + arrayValues[9] + arrayValues[10]
        : null,
      idEfector: arrayValues[11] ? arrayValues[11] : arrayValues[3],
      idPrescr: arrayValues[2] ? arrayValues[2] : null,
    };
    const url = this.url + this.urlPlat + "registracion/";
    return this.httpService.post(url, body, { headers }).pipe(
      map((res) => ({
        url: this.url,
        envio: body,
        params: {},
        headers: headers,
        data: res.data,
      })),
      catchError((e) => {
        return of({
          data: e,
          envio: body,
          params: {},
          headers: headers,
          url: url,
        });
      })
    );
  }

  async login(cuit): Promise<Observable<any>> {
    return this.httpService
      .post(this.url + "v0/auth-login/", {
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
        })
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
      (await this.elegibilidad(arrayValues)).subscribe(async (data) => {
        let estatus;
        let dataHttp = data.data;
        let datos: DatosElegibilidad = new DatosElegibilidad();
        let datosTasy: any = {
          "NroAfiliado" : arrayValues[3], 
          "MotivoRechazo" : ""
        }
        if (dataHttp.rechaCabecera === 0) {
          estatus = 1;
          datos = {
            nroAfiliado: arrayValues[3],
            nroDocumento: null,
            estadoAfiliado: dataHttp.rechaCabecera === 0 ? true : false,
            // tslint:disable-next-line: radix
            edad: parseInt(dataHttp.edad),
            voluntario: dataHttp.gravado === "1" ? true : false,
            fechaNac: null,
            plan: dataHttp.planCodi,
            planDescripcion: "",
            genero: dataHttp.sexo === "M" ? "Masculino" : "Femenino",
            codigoPostal: null,
            localidad: "",
            nombreApellido: dataHttp.apeNom,
            servicio: null,
            tipoDocumento: "",
            tipoDocumentoDescripcion: "",
            recupero: dataHttp.gravado === "1" ? true : false,
          };
          datosTasy.EstadoIntegrante = dataHttp.rechaCabecera === 0 ? 'A' : 'I';
          datosTasy.NombreApellido = dataHttp.apeNom;
        } else {
          estatus = 0;
          datosTasy.MotivoRechazo = dataHttp.rechaCabeDeno;
          if (dataHttp.rechaCabeDeno) {
            const err = await this.erroresService.findOne({
              valueStandard: 3,
            });
            datosTasy.EstadoIntegrante = 'E';
            datos.errorEstandarizado = err.description;
            datos.errorEstandarizadoCodigo = err.valueStandard;
            datosTasy.MotivoRechazo = err.description;
          }
        }
        resolve({
          ...datosTasy,
          data: dataHttp,
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
  getToken(cuit): any {
    return new Promise(async (resolve) => {
      (await this.login(cuit)).subscribe((data) => {
        resolve(data);
      });
    });
  }
}
