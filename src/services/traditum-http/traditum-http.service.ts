import { HttpService, Injectable } from "@nestjs/common";
import moment = require("moment");
import { of } from "rxjs";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { ErroresService } from "../errores/errores.service";
const crypto = require("crypto");
@Injectable()
export class TraditumHttpService {
  url;
  user = "IA000001";
  password = "IA000001";
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
  md5 = (text) => {
    return crypto
      .createHash("md5")
      .update(text)
      .digest();
  };
  decrypt(text) {
    const decipher = crypto.createDecipheriv(
      "des-ede3",
      "1234567890123456ABCDEFGH",
      ""
    );
    let decrypt = decipher.update(text, "base64", "utf8");
    decrypt += decipher.final();
    return decrypt;
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

  async elegibilidad(htl7): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders();
    const body = {
      Msg: htl7,
      MsgType: "SI",
    };
    const url = this.url + "api/Enviar/";
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
  getElegibilidad(hl7): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(hl7)).subscribe((data) => {
        let estatus;
        let datos: DatosElegibilidad;
        let datosTasy: any = {
          "MotivoRechazo" : "",
          EstadoIntegrante : 'I'
        }
        if (data.data.rechaCabecera === 0) {
          estatus = 1;
          datosTasy.EstadoIntegrante = 'A'
        } else {
          estatus = 0;
        }
        let response = {}
        try {
          response = this.decrypt(data.data)
        } catch (error) {
          datosTasy.EstadoIntegrante = 'E'
        }
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
    const date = moment(new Date()).format("yyyymmddhhmmss");
    const number = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const prestaciones = arrayValues[0].map((item) => {
      return (
        `
        PR1|`+item.cantidad +`||`+item.codigoPrestacion +`
        AUT||||||||1
        ZAU||||||0{$
      `
      );
    });
    const text =
      `MSH|^~\&|` +
      emisor +
      `|` +
      sitioEmisor +
      `|` +
      idSitioReceptor +
      `|` +
      sitioReceptor +
      `|` +
      date +
      `||ZQI^Z01^ZQI_Z01|` +
      date +
      number.toString() +
      `|P|` +
      version +
      `|||NE|AL|ARG
        PRD|PS^` +
      arrayValues[6] +
      `||^^^` +
      arrayValues[3] +
      `||||` +
      arrayValues[4] +
      `^` +
      arrayValues[5] +
      `
        PID|||` +
      arrayValues[7] +
      `^^^` +
      autoridad +
      `^` +
      identificacion +
      `~` +
      arrayValues[7] +
      `||UNKNOWN^UNKNOWN`+ prestaciones +`
        PV1||` +
      tipoPaciente +
      `||P|||||||||||||||||||||||||||||||||||||||||||||||V`;
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
    const date = moment(new Date()).format("yyyymmddhhmmss");
    const number = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const text =
      `MSH|^~\&|` +
      emisor +
      `|` +
      sitioEmisor +
      `|` +
      idSitioReceptor +
      `|` +
      sitioReceptor +
      `|` +
      date +
      `||ZQI^Z01^ZQI_Z01|` +
      date +
      number.toString() +
      `|P|` +
      version +
      `|||NE|AL|ARG
        PRD|PS^` +
      arrayValues[3] +
      `||^^^` +
      arrayValues[0] +
      `||||` +
      arrayValues[1] +
      `^` +
      arrayValues[2] +
      `
        PID|||` +
      arrayValues[5] +
      `^^^` +
      autoridad +
      `^` +
      identificacion +
      `~` +
      arrayValues[4] +
      `||UNKNOWN^UNKNOWN
        PV1||` +
      tipoPaciente +
      `||P|||||||||||||||||||||||||||||||||||||||||||||||V`;
    return text;
  }
  returnXmlGaleno(arrayValues: any[]) {
    const emisor = "TRIA0100M";
    const sitioEmisor = "TRIA00000001";
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
