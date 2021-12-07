import { HttpService, Injectable } from "@nestjs/common";
import moment = require("moment");
import { of } from "rxjs";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { ErroresService } from "../errores/errores.service";
import { hl7Elegibilidad } from "./hl7-elegibilidad";
const parser = require('@rimiti/hl7-object-parser')
@Injectable()
export class TraditumHttpService {
  url;
  user = "IA010163";
  password = "IA010163";
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
  getToken(): any {
    return new Promise(async (resolve) => {
      (await this.login()).subscribe((data) => {
        resolve(data);
      });
    });
  }
  async login(): Promise<Observable<any>> {
    return this.httpService
      .post(
        this.url + "api/login",
        {},
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(this.user + ":" + this.password).toString("base64"),
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
  async getSessionHeaders() {
    const token = await this.getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return headers;
  }
  async autorizacion(htl7): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders();
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
  async elegibilidad(htl7): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders();
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
  getAutorizacion(hl7): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(hl7)).subscribe((data) => {
        console.log(data.data)
        resolve({
          data: data.data,
          datosFinales: data,
          envio: data.envio,
          params: data.params,
          url: data.url,
          headers: data.headers,
        });
      });
    });
  }
  getElegibilidad(hl7): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(hl7)).subscribe((data) => {
        let estatus;
        let datos: DatosElegibilidad;
        let datosTasy: any = {
          "MotivoRechazo" : "",
          EstadoIntegrante : 'I'
        }
        console.log(data)
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
    const prestaciones = arrayValues[0].map((item) => {
      return (
        `
        PR1|`+item.cantidad +`||`+item.codigoPrestacion +`
        AUT||||||||1
        ZAU||||||0{$
      `
      );
    });
    const text = 'MSH|^~\\{|TRIA0100M|TRIA00000002|SERV|GALENO^610142^IIN|20110527105446||ZQI^Z01^ZQI_Z01|11052710544688244601|P|2.4|||NE|AL|ARG\r\nPRD|PS^Prestador Solicitante||^^^C||||33502^PR\r\nPID|||10186602^^^GALENO^HC||UNKNOWN\r\nPV1||O||P|||||||||||||||||||||||||||||||||||||||||||||||V'
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
    console.log(arrayValues)
    const text = `MSH|^~\\{|` +emisor +`|` +sitioEmisor +`|` +idSitioReceptor +`|` +sitioReceptor +`|` +date +`||ZQI^Z01^ZQI_Z01|11052710544688244601|P|` +version +`|||NE|AL|ARG\r\nPRD|PS^` +arrayValues[3] +`||^^^`+arrayValues[0]+`||||`+arrayValues[1]+`^`+arrayValues[2]+`\r\nPID|||`+arrayValues[5]+`^^^` +autoridad +`^`+identificacion+`||UNKNOWN\r\nPV1||`+tipoPaciente+`||P|||||||||||||||||||||||||||||||||||||||||||||||V`
    console.log(text)
    return text;
  }
  returnXmlGalenoAutorizacion(arrayValues: any[]) {
    const emisor = "TRIA0100M";
    const sitioEmisor = "TRIA00000002";
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
    return this.getAutorizacion(hl7);
  }
  returnXmlGaleno(arrayValues: any[]) {
    const emisor = "TRIA0100M";
    const sitioEmisor = "TRIA00000002";
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
    return this.getElegibilidad(hl7);
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
    return this.getElegibilidad(hl7);
  }
}
