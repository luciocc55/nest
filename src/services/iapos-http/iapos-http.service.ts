import { Injectable, HttpService } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import xmlParser = require("xml2json");
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";

@Injectable()
export class IaposHttpService {
  url = "https://aswe.santafe.gov.ar/iapos-sw-srvt/servlet/";
  headers = { "Content-Type": "text/xml" };
  constructor(private readonly httpService: HttpService) {}
  async elegibilidad(arrayValues): Promise<Observable<RespuestaHttp>> {
    const usuario = "PSICOREDWS";
    const password = "psico123";
    if (!arrayValues[1]) {
      arrayValues[1] = "?";
    }
    const xml =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:iap="IAPOS_WS">
        <soapenv:Header/>
        <soapenv:Body>
           <iap:BEWsValidaAfi.Execute>
              <iap:Usuario>` +
      usuario +
      `</iap:Usuario>
              <iap:Passwd>` +
      password +
      `</iap:Passwd>
              <iap:Nafiliado>` +
      arrayValues[1] +
      `</iap:Nafiliado>
              <iap:Badocnumdo>` +
      arrayValues[0] +
      `</iap:Badocnumdo>
              <iap:Tidocodigo_de_documento>1</iap:Tidocodigo_de_documento>
              <iap:Ogorcodigo>1</iap:Ogorcodigo>
              <iap:Fechpresta>?</iap:Fechpresta>
           </iap:BEWsValidaAfi.Execute>
        </soapenv:Body>
        </soapenv:Envelope>`;
    const url = this.url + "abewsvalidaafi?wsdl";
    return this.httpService.post(url, xml, { headers: this.headers }).pipe(
      map((res) => ({
        url: this.url,
        envio: xml,
        params: {},
        headers: this.headers,
        data: xmlParser.toJson(res.data, { object: true }),
      })),
      catchError((e) => {
        return of({
          data: e,
          envio: xml,
          params: {},
          headers: this.headers,
          url: url,
        });
      })
    );
  }
  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        const info =
          data.data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][
            "BEWsValidaAfi.ExecuteResponse"
          ];
        let estatus;
        let datos: DatosElegibilidad = new DatosElegibilidad();
        let datosTasy: any = {
          MotivoRechazo: "",
          EstadoIntegrante: "I",
        };
        try {
          if (info["Estado"]["$t"] === "A") {
            estatus = 1;
            datosTasy.NroAfiliado = info["Nafiliado"]["$t"];
            datosTasy.EstadoIntegrante = 'A';
            datosTasy.NombreApellido = info["Apenom"]["$t"];
            datos = {
              nroAfiliado: info["Nafiliado"]["$t"],
              nroDocumento: info["Badocnumdo"]["$t"],
              estadoAfiliado: info["Estado"]["$t"] === "A" ? true : false,
              // tslint:disable-next-line: radix
              edad: parseInt(info["Edad"]["$t"]),
              voluntario: null,
              fechaNac: info["Fechanac"]["$t"],
              plan: "",
              planDescripcion: "",
              genero: info["Sexo"]["$t"] === "1" ? "Masculino" : "Femenino",
              codigoPostal: info["Codpos"]["$t"],
              localidad: info["Localidad"]["$t"],
              nombreApellido: info["Apenom"]["$t"],
              servicio: info["Servicio"]["$t"] === "S" ? true : false,
              tipoDocumento: info["Tidocodigo_de_documento"]["$t"],
              tipoDocumentoDescripcion: info["Tidodescri_documento"]["$t"],
              recupero: ["Recupero"]["$t"] === "S" ? true : false,
            };
          } else {
            estatus = 0;
          }
        } catch (error) {
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
}
