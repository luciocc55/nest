import { HttpService, Injectable } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import xmlParser = require("xml2json");
@Injectable()
export class ActiviaHttpService {
  url;
  headers = { "Content-Type": "text/xml" };
  constructor(private readonly httpService: HttpService) {
    if (process.env.Production === "true") {
      this.url = "http://wsconectado.activiaweb.com.ar/WSActiviaC.asmx?WSDL";
    } else {
      this.url =
        "http://wsconectadotest.activiaweb.com.ar/WSActiviaC.asmx?WSDL";
    }
  }
  async elegibilidad(arrayValues, os): Promise<Observable<any>> {
    return this.httpService
      .post(this.url, this.xmlElegibilidad(arrayValues, os), {
        headers: this.headers,
      })
      .pipe(
        map((res) => xmlParser.toJson(res.data, { object: true })),
        catchError((e) => {
          return of({ e });
        })
      );
  }
  getElegibilidadOSPDC(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, "PATCAB")).subscribe((data) => {
        const datosParseados = xmlParser.toJson(
          data["soap:Envelope"]["soap:Body"]['ExecuteFileTransactionSLResponse']['ExecuteFileTransactionSLResult'],
          { object: true }
        );
        let estatus;
        try {
          if (datosParseados.Mensaje?.EncabezadoMensaje?.Rta.CodRtaGeneral === '00') {
            estatus = 1;
          } else {
            estatus = 0;
          }
        } catch (error) {
          estatus = 0;
        }
        resolve({ data: datosParseados, estatus });
      });
    });
  }
  xmlElegibilidad(arrayValues, os) {
    const xml =
      `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
          <soap:Header/>
          <soap:Body>
             <tem:ExecuteFileTransactionSL>
                <!--Optional:-->
                <tem:pos></tem:pos>
                <!--Optional:-->
                <tem:fileContent><![CDATA[<?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?><Mensaje><EncabezadoMensaje><VersionMsj>ACT20</VersionMsj><TipoMsj>OL</TipoMsj><TipoTransaccion>01A</TipoTransaccion><IdMsj>123456789</IdMsj><InicioTrx><FechaTrx>20210115</FechaTrx></InicioTrx><Terminal><TipoTerminal>PC</TipoTerminal><NumeroTerminal>` +arrayValues[1] +`</NumeroTerminal></Terminal><Financiador><CodigoFinanciador>` +os +`</CodigoFinanciador></Financiador><Prestador><CuitPrestador>` +arrayValues[0] +`</CuitPrestador><RazonSocial>?</RazonSocial></Prestador></EncabezadoMensaje><EncabezadoAtencion><Credencial><NumeroCredencial>0100002205</NumeroCredencial><ModoIngreso>M</ModoIngreso></Credencial></EncabezadoAtencion></Mensaje>]]></tem:fileContent></tem:ExecuteFileTransactionSL>
          </soap:Body>
         </soap:Envelope>`;
    return xml;
  }
}
