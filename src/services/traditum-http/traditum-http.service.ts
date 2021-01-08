import { Injectable } from "@nestjs/common";
import moment = require("moment");
@Injectable()
export class TraditumHttpService {
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
    return hl7;
  }
}
