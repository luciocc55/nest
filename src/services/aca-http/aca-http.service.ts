import { HttpService, Injectable } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import xmlParser = require("xml2json");
import { ErroresService } from "../errores/errores.service";
import { FunctionsService } from "../functions";
@Injectable()
export class AcaHttpService {
  url = "https://cauat.acasalud.com.ar:443/SSCaws/Servicios";
  headers = { "Content-Type": "text/xml" };
  constructor(private readonly httpService: HttpService, private functionService: FunctionsService, private erroresService: ErroresService) {}
  async autorizacion(arrayValues): Promise<Observable<RespuestaHttp>> {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
    const usuario = "5092071";
    const password = "DAT_MGR";
    const prestaciones = arrayValues[0].map((item) => {
      return (
        `
        <PR>
        <TIPO>P</TIPO>
        <ID>` +
        item.codigoPrestacion +
        `</ID>
        <CANT>` +
        item.cantidad +
        `</CANT>
     </PR>
      `
      );
    });
    const date = this.functionService.returnDate(new Date());
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
            <TIPO>AP</TIPO>
            <IDASEG>ACA_SALUD</IDASEG>
            <IDPRESTADOR>` +
      arrayValues[3] +
      `</IDPRESTADOR>
      <FECHA>`+date+`</FECHA>
        </OPER>
        <PID>
            <TIPOID>CODIGO</TIPOID>
            <ID>` +
      arrayValues[4] + arrayValues[5] +
      `</ID>
            <VERIFID>MANUAL</VERIFID>
        </PID>
        <CONTEXTO>
        <TIPO>A</TIPO>
     </CONTEXTO>
     <PRESCRIP>
        <MAT>`+arrayValues[2]+`</MAT>
        <FECHA>`+date+`</FECHA>
     </PRESCRIP>
     `+prestaciones+`
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
  async elegibilidad(arrayValues): Promise<Observable<RespuestaHttp>> {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
    const usuario = "5092071";
    const password = "DAT_MGR";
    if (!arrayValues[1]) {
      arrayValues[1] = "?";
    }
    const date = this.functionService.returnDate(new Date());
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
            <FECHA>`+date+`</FECHA>
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
  getAutorizacion(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(arrayValues)).subscribe(async (data) => {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = null;
        let estatus;
        let resultados = [];
        let error;
        let numeroTransaccion = null;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        const dataHttp = data.data;
        let datosTasy: any = {
          Estado: false,
        };
        try {
          const datosParseados = xmlParser.toJson(
            data?.data["S:Envelope"]["S:Body"]["ns0:transaccionstrResponse"][
              "return"
            ],
            { object: true }
          )?.RESPUESTA;
          if (datosParseados) {
            if (datosParseados?.STATUS === 'OK') {
              if (!Array.isArray(datosParseados.PR)) {
                datosParseados.PR = [datosParseados.PR]
              }
              estatus = 1;
              datosTasy.Estado = true;
              datosTasy.NroAtención = dataHttp.NumeroOrden;
              numeroTransaccion = datosParseados.IDTRAN;
              resultados =  datosParseados.PR.map((item) => ({
                prestación: item.ID,
                CodigoPrestacion: item.ID,
                Cantidad: item.CANT,
                mensaje: item.RSPMSGP,
                transaccion:  datosParseados.IDTRAN,
                cantidad: item.CANT,
                copago: item.CARGO,
                Copago: item.CARGO,
                Estado: item.STATUS === 'OK'? 'A': 'R',
                estado: item.estatus === 'OK'? 0: 1,
              }));
            } else {
              const err = await this.erroresService.findOne({
                "values.value": dataHttp?.Mensaje?.toString(),
                "values.origen": origen,
              });
              datosTasy.Error = 0;
              datosTasy.MotivoRechazo = dataHttp.Mensaje;
              if (err) {
                errorEstandarizado = err.description;
                errorEstandarizadoCodigo = err.valueStandard;
                datosTasy.Error = err.valueStandard;
                datosTasy.MotivoRechazo = err.description;
              }
              estatus = 0;
              error = dataHttp.Mensaje;
            }
          } else {
            estatus = 0;
            datosTasy.MotivoRechazo = "Por favor, intente nuevamente";
            error = "Por favor, intente nuevamente";
          }
        } catch (error) {
          console.log(error);
          datosTasy.EstadoIntegrante = 'E';
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
  getCancelarAutorizacion(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.cancelarAutorizacion(arrayValues)).subscribe(async (data) => {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = null;
        let estatus;
        let error;
        let numeroTransaccion = null;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        let datosTasy: any = {
          Estado: false,
        }
        try {
          const datosParseados = xmlParser.toJson(
            data?.data["S:Envelope"]["S:Body"]["ns0:transaccionstrResponse"][
              "return"
            ],
            { object: true }
          )?.RESPUESTA;
          if (datosParseados.STATUS === 'OK')  {
            estatus = 1;
          } else {
            estatus = 0;
            datosTasy.MotivoRechazo = datosParseados.RSPMSGGADIC;
            error = datosParseados.RSPMSGGADIC;
          }
          numeroTransaccion = datosParseados.IDTRAN;
          resolve({
            data: datosParseados,
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
        } catch (error) {
          console.log(error);
          datosTasy.EstadoIntegrante = 'E';
        }
        resolve({
          data: data.data,
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
  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = null;
        let estatus = 0;
        let datosTasy: any = {
          "NroAfiliado" : arrayValues[3], 
          "MotivoRechazo" : ""
        }
        try {
          const datosParseados = xmlParser.toJson(
            data?.data["S:Envelope"]["S:Body"]["ns0:transaccionstrResponse"][
              "return"
            ],
            { object: true }
          );
          if (!datosParseados.RESPUESTA.RSPMSGGADIC) {
            estatus = 1;
            datosTasy.NroAfiliado = datosParseados.RESPUESTA.AFICODIGO;
            datosTasy.NombreApellido = datosParseados.RESPUESTA.AFIAPE + ' ' + datosParseados.RESPUESTA.AFINOM;
            datosTasy.EstadoIntegrante = 'A';
          }
          resolve({
            data: datosParseados,
            ...datosTasy,
            estatus,
            params: data.params,
            envio: data.envio,
            url: data.url,
            headers: data.headers,
          });
        } catch (error) {
          console.log(error);
          datosTasy.EstadoIntegrante = 'E';
        }
        resolve({
          data: data.data,
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


  async cancelarAutorizacion(arrayValues): Promise<Observable<RespuestaHttp>> {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
    const usuario = "5092071";
    const password = "DAT_MGR";
    const date = this.functionService.returnDate(new Date());
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
            <TIPO>ATR</TIPO>
            <IDASEG>ACA_SALUD</IDASEG>
            <IDPRESTADOR>` +
      arrayValues[1] +
      `</IDPRESTADOR>
      <IDANUL>` +
      arrayValues[0] +`</IDANUL>
      <FECHA>`+date+`</FECHA>
        </OPER>
        <PID>
            <TIPOID>CODIGO</TIPOID>
            <ID></ID>
            <VERIFID>MANUAL</VERIFID>
        </PID>
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
}
