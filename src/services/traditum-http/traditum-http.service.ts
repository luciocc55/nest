import { HttpService, Injectable } from "@nestjs/common";
import moment = require("moment");
import { of } from "rxjs";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { ErroresService } from "../errores/errores.service";
import { hl7Elegibilidad } from "./hl7-elegibilidad";
import { hl7Autorizacion } from "./hl7-autorizacion";

const parser = require('@rimiti/hl7-object-parser')
@Injectable()
export class TraditumHttpService {
  url;
  constructor(
    private readonly httpService: HttpService,
    private erroresService: ErroresService
  ) {
    if (process.env.Production === "true") {
      this.url = "https://traditumcanalws.azurewebsites.net/";
    } else {
      this.url = "https://traditumcanalws-testing.azurewebsites.net/";
    }
  }
  getToken(user, password): any {
    return new Promise(async (resolve) => {
      (await this.login(user, password)).subscribe((data) => {
        resolve(data);
      });
    });
  }
  async login(user, password): Promise<Observable<any>> {
    return this.httpService
      .post(
        this.url + "api/login",
        {},
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(user + ":" + password).toString("base64"),
          },
        }
      )
      .pipe(
        map((res) => res.data.access_token),
        catchError((e) => {
          return of({ e });
        })
      );
  }
  async getSessionHeaders(user, password) {
    const token = await this.getToken(user, password);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return headers;
  }
  async autorizacion(htl7, usuario, password): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders(usuario, password);
    const body = {
      Msg: htl7,
      MsgType: "SI",
    };
    const url = this.url + "api/EnviarFlat/";
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
  async elegibilidad(htl7, usuario, password): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders(usuario, password);
    const body = {
      Msg: htl7,
      MsgType: "SI",
    };
    const url = this.url + "api/EnviarFlat/";
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
  getAutorizacion(hl7, usuario, password): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(hl7, usuario, password)).subscribe((data) => {
        const obj = parser.decode(data.data, hl7Autorizacion)
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
        if (obj.msa.codigoEstado === 'B000') {
          if (obj.zau[0].codigoEstado === 'B000') {
            estatus = 1;
            datosTasy.Estado = true;
            const zauPrestaciones = obj.zau.slice(1,obj.zau.length)
            const prestaciones = obj.pr1;
            prestaciones.forEach((element,index) => {
              const find = resultados.findIndex((findElem) => findElem.prestación === element.prestacion)
              const cantidad = zauPrestaciones[index].codigoEstado === 'B000'? 1: 0;
              const recha = zauPrestaciones[index].codigoEstado !== 'B000'? 1: 0;
              if (find > -1) {
                resultados[find].cantidad = resultados[find].cantidad + cantidad;
                resultados[find].Cantidad = resultados[find].Cantidad + cantidad;
                resultados[find].Rechazadas = resultados[find].Rechazadas + recha;
                resultados[find].rechazadas = resultados[find].rechazadas + recha;
              } else {
                resultados.push({
                prestación: element.prestacion,
                CodigoPrestacion:element.prestacion,
                transaccion: obj.zau[0].id,
                mensaje: zauPrestaciones[index].estado,
                cantidad: cantidad,
                Cantidad: cantidad,
                Rechazadas: recha,
                rechazadas: recha,
                copago: parseFloat(zauPrestaciones[index].copago.replace('&$','')),
                Copago: parseFloat(zauPrestaciones[index].copago.replace('&$','')),
                Estado: zauPrestaciones[index].codigoEstado === 'B000'? 'A': 'R',
                estado: zauPrestaciones[index].codigoEstado,
                })
              }
            });
            datosTasy.Prestaciones = resultados;
            datosTasy.NroAtención = obj.zau[0].id;
            numeroTransaccion = obj.zau[0].id;
          } else {
            datosTasy.Error = 0;
            datosTasy.MotivoRechazo = obj.zau[0].estado;
            estatus = 0;
            error = obj.zau[0].estado;
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
  getElegibilidad(hl7, usuario, password): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(hl7, usuario, password)).subscribe((data) => {
        let estatus;
        let datos: DatosElegibilidad;
        let datosTasy: any = {
          "MotivoRechazo": "",
          EstadoIntegrante: 'I'
        }
        const obj = parser.decode(data.data, hl7Elegibilidad)
        console.log(obj)
        if (data.data.rechaCabecera === 0) {
          estatus = 1;
          datosTasy.EstadoIntegrante = 'A'
        } else {
          estatus = 0;
        }
        let response = {}

        resolve({
          data: response,
          datosFinales: datos,
          ...datosTasy,
          estatus,
          envio: data.envio,
          params: data.params,
          url: data.url,
          headers: data.headers,
        });
      });
    });
  }
  hl7Autorizacion(
    arrayValues: any[],
    emisor,
    sitioEmisor,
    idSitioReceptor,
    sitioReceptor,
    version,
    autoridad,
    identificacion,
    tipoPaciente
  ) {
    const date = moment(new Date()).format("YYYYMMDDhhmmss");
    let ocurrencia = 1;
    const prestaciones = arrayValues[0].map((item) => {
      let msg = ''
      for (let cantidad = 0; cantidad < item.cantidad; cantidad++) {
        msg = `${msg}PR1|${ocurrencia}||${item.codigoPrestacion}\rAUT||||||||1\rZAU||||||0&$\r`
        ocurrencia++
      }
      return (
        msg
      );
    });
    const text = `MSH|^~\\{|${emisor}|${sitioEmisor}|${idSitioReceptor}|${sitioReceptor}|${date}||ZQA^Z02^ZQA_Z02|11052710544688244601|P|${version}|||NE|AL|ARG\rPRD|PS^${arrayValues[9]}||^^^${arrayValues[6]}||||${arrayValues[7]}^${arrayValues[8]}\rPID|||${arrayValues[10]}^^^${autoridad}^${identificacion}||UNKNOWN\r${prestaciones}PV1||${tipoPaciente}||P|||||||||||||||||||||||||||||||||||||||||||||||V`
    return text;
  }

  hl7Elegibilidad(
    arrayValues: any[],
    emisor,
    sitioEmisor,
    idSitioReceptor,
    sitioReceptor,
    version,
    autoridad,
    identificacion,
    tipoPaciente
  ) {
    const date = moment(new Date()).format("YYYYMMDDhhmmss");
    const text = `MSH|^~\\{|` + emisor + `|` + sitioEmisor + `|` + idSitioReceptor + `|` + sitioReceptor + `|` + date + `||ZQI^Z01^ZQI_Z01|11052710544688244601|P|` + version + `|||NE|AL|ARG\rPRD|PS^` + arrayValues[6] + `||^^^` + arrayValues[3] + `||||` + arrayValues[4] + `^` + arrayValues[5] + `\rPID|||` + arrayValues[8] + `^^^` + autoridad + `^` + identificacion + `||UNKNOWN\rPV1||` + tipoPaciente + `||P|||||||||||||||||||||||||||||||||||||||||||||||V`
    return text;
  }
  returnXmlGalenoAutorizacion(arrayValues: any[]) {
    const emisor = "TRIA0100M";
    const sitioEmisor = arrayValues[3];
    const idSitioReceptor = "SERV";
    const sitioReceptor = "GALENO^610142^IIN";
    const version = "2.4";
    const autoridad = "GALENO";
    const identificacion = "HC";
    const tipoPaciente = "O";
    const hl7 = this.hl7Autorizacion(
      arrayValues,
      emisor,
      sitioEmisor,
      idSitioReceptor,
      sitioReceptor,
      version,
      autoridad,
      identificacion,
      tipoPaciente
    );
    return this.getAutorizacion(hl7, arrayValues[4], arrayValues[5]);
  }
  returnXmlGaleno(arrayValues: any[]) {
    const emisor = "TRIA0100M";
    const sitioEmisor = arrayValues[0];
    const idSitioReceptor = "SERV";
    const sitioReceptor = "GALENO^610142^IIN";
    const version = "2.4";
    const autoridad = "GALENO";
    const identificacion = "HC";
    const tipoPaciente = "O";
    const hl7 = this.hl7Elegibilidad(
      arrayValues,
      emisor,
      sitioEmisor,
      idSitioReceptor,
      sitioReceptor,
      version,
      autoridad,
      identificacion,
      tipoPaciente
    );
    return this.getElegibilidad(hl7, arrayValues[1], arrayValues[2]);
  }
  returnXmlMedife(arrayValues: any[]) {
    const emisor = "TRIA0100M";
    const sitioEmisor = "TRIA00000001";
    const idSitioReceptor = "SERV";
    const sitioReceptor = "MEDIFE^222222^IIN";
    const version = "2.4";
    const autoridad = "MEDIFE";
    const identificacion = "HC";
    const tipoPaciente = "O";
    const hl7 = this.hl7Elegibilidad(
      arrayValues,
      emisor,
      sitioEmisor,
      idSitioReceptor,
      sitioReceptor,
      version,
      autoridad,
      identificacion,
      tipoPaciente
    );
    return this.getElegibilidad(hl7, arrayValues[1], arrayValues[2]);
  }
}
