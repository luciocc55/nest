import { HttpService, Injectable } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import xmlParser = require("xml2json");
@Injectable()
export class AcaHttpService {
  url = "https://cauat.acasalud.com.ar:443/SSCaws/Servicios";
  headers = { "Content-Type": "text/xml" };
  constructor(private readonly httpService: HttpService) {}
  async elegibilidad(arrayValues): Promise<Observable<RespuestaHttp>> {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
    const usuario = "5092071";
    const password = "DAT_MGR";
    if (!arrayValues[1]) {
      arrayValues[1] = "?";
    }
    const xml =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://caws/Servicios.wsdl">
        <soapenv:Header/>
        <soapenv:Body>
           <ser:transaccionstr>
              <!--Optional:-->
              <pSolicitud>
              <![CDATA[ <SOLICITUD>
        <EMISOR>
            <ID>Avalian-PreProd</ID>
            <PROT>CA_V20</PROT>
            <MSGID>000111279</MSGID>
            <TER>Web</TER>
            <APP>HMS_CAWeb</APP>
            <TIME>2020-11-5T17:01:34</TIME>
        </EMISOR>
        <SEGURIDAD>
            <TIPOAUT>U</TIPOAUT>
            <TIPOCON>PRES</TIPOCON>
            <USRID>` +
      usuario +
      `</USRID>
            <USRPASS>` +
      password +
      `</USRPASS>
        </SEGURIDAD>
        <OPER>
            <TIPO>ELG</TIPO>
            <IDASEG>ACA_SALUD</IDASEG>
            <IDPRESTADOR>` +
      arrayValues[0] +
      `</IDPRESTADOR>
            <FECHA>2020-11-05</FECHA>
        </OPER>
        <PID>
            <TIPOID>CODIGO</TIPOID>
            <ID>` +
      arrayValues[2] +
      `</ID>
            <VERIFID>MANUAL</VERIFID>
        </PID>
        <CONTEXTO>
            <TIPO>A</TIPO>
        </CONTEXTO>
        </SOLICITUD>]]>
                </pSolicitud>
            </ser:transaccionstr>
            </soapenv:Body>
        </soapenv:Envelope>`;
    return this.httpService.post(this.url, xml, { headers: this.headers }).pipe(
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
          url: this.url,
        });
      })
    );
  }
  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = null;
        let estatus = 0;
        try {
          const datosParseados = xmlParser.toJson(
            data?.data["S:Envelope"]["S:Body"]["ns0:transaccionstrResponse"][
              "return"
            ],
            { object: true }
          );
          if (!datosParseados.RESPUESTA.RSPMSGGADIC) {
            estatus = 1;
          }
          resolve({
            data: datosParseados,
            estatus,
            params: data.params,
            envio: data.envio,
            url: data.url,
            headers: data.headers,
          });
        } catch (error) {
          console.log(error);
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
}
