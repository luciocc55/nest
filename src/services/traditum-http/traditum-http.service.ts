import { HttpService, Injectable } from "@nestjs/common";
import moment = require("moment");
import { of } from "rxjs";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { ErroresService } from "../errores/errores.service";
const crypto = require('crypto');
@Injectable()
export class TraditumHttpService {
  url;
  user = 'IA000001'
  password = 'IA000001'
  constructor(
    private readonly httpService: HttpService,
    private erroresService: ErroresService,
  ) {
    if (process.env.Production === 'true') {
      this.url = 'https://traditumcanalws.azurewebsites.net/';
    } else {
      this.url = 'https://traditumcanalws-testing.azurewebsites.net/';
    }
  }
  md5 = text => {
    return crypto
        .createHash('md5')
        .update(text)
        .digest();
    }
  decrypt(text) {
    const decipher = crypto.createDecipheriv('des-ede3', '1234567890123456ABCDEFGH', '');
    let decrypt = decipher.update(text, 'base64', 'utf8');
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
      .post(this.url + 'api/login',{}, {headers: {Authorization: 'Basic ' + Buffer.from(this.user + ':' + this.password).toString('base64')}})
      .pipe(
        map((res) => res.data.access_token),
        catchError((e) => {
          return of({ e });
        }),
      );
  }
  async getSessionHeaders() {
    const token = await this.getToken();
    console.log(token)
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return headers;
  }

  async elegibilidad(htl7): Promise<Observable<any>> {
    const headers = await this.getSessionHeaders();
    console.log(headers)
    return this.httpService
      .post(
        this.url + 'api/Enviar/',
        {
          Msg: htl7,
          MsgType: 'SI',
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
  getElegibilidad(hl7): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(hl7)).subscribe((data) => {
        let estatus;
        let datos: DatosElegibilidad;
        if (data.rechaCabecera === 0) {
          estatus = 1;
        } else {
          estatus = 0;
        }
        resolve({ data:this.decrypt(data), estatus, datosFinales: datos });
      });
    });
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

  returnXmlGaleno() {
    const emisor = "TRIA0100M";
    const sitioEmisor = "TRIA00000001";
    const idSitioReceptor = "SERV";
    const sitioReceptor = "GALENO^610142^IIN";
    const version = "2.4";
    const autoridad = "GALENO";
    const identificacion = "HC";
    const tipoPaciente = "O";
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