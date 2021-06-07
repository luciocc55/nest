import { HttpService, Injectable } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import xmlParser = require("xml2json");
import moment = require("moment");
import { ErroresService } from "../errores/errores.service";
@Injectable()
export class ActiviaHttpService {
  url;
  headers = { "Content-Type": "text/xml" };
  constructor(
    private readonly httpService: HttpService,
    private erroresService: ErroresService
  ) {
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
  async autorizacion(arrayValues, os): Promise<Observable<any>> {
    console.log(this.xmlAutirizacion(arrayValues, os));
    return this.httpService
      .post(this.url, this.xmlAutirizacion(arrayValues, os), {
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
          data["soap:Envelope"]["soap:Body"][
            "ExecuteFileTransactionSLResponse"
          ]["ExecuteFileTransactionSLResult"],
          { object: true }
        );
        let estatus;
        try {
          if (
            datosParseados.Mensaje?.EncabezadoMensaje?.Rta.CodRtaGeneral ===
            "00"
          ) {
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
  getAutorizacionOSPDC(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(arrayValues, "PATCAB")).subscribe(
        async (data) => {
          const datosParseados = xmlParser.toJson(
            data["soap:Envelope"]["soap:Body"][
              "ExecuteFileTransactionSLResponse"
            ]["ExecuteFileTransactionSLResult"],
            { object: true }
          )?.Mensaje;
          let estatus;
          let resultados = [];
          let error;
          let numeroTransaccion = null;
          let errorEstandarizado = null;
          let errorEstandarizadoCodigo = null;
          if (datosParseados.EncabezadoMensaje) {
            if (datosParseados.EncabezadoMensaje.Rta === "00") {
              estatus = 1;
              resultados = datosParseados.DetalleProcedimientos.map(
                (element) => {
                  let estado;
                  if (element.CodRta === "00") {
                    estado = true;
                  } else {
                    estado = false;
                  }
                  return {
                    prestación: element.CodPrestacion,
                    transaccion: datosParseados.EncabezadoMensaje.NroReferencia,
                    mensaje: element?.MensajeRta,
                    cantidad: parseInt(element.CantidadSolicitada),
                    rechazadas:
                      parseInt(element.CantidadSolicitada) -
                      parseInt(element.CantidadAprobada),
                    copago: element.ArancelPrestacion,
                    estado,
                  };
                }
              );
              numeroTransaccion = datosParseados.EncabezadoMensaje.transac;
            } else {
              const err = await this.erroresService.findOne({
                "values.value": datosParseados.EncabezadoMensaje.Rta?.CodRtaGeneral.toString(),
                "values.origen": origen,
              });
              if (err) {
                errorEstandarizado = err.description;
                errorEstandarizadoCodigo = err.valueStandard;
              }
              estatus = 0;
              error =
                datosParseados.EncabezadoMensaje.Rta?.DescripcionRtaGeneral;
            }
          } else {
            estatus = 0;
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
            data:datosParseados,
            resultado: datos,
            datosFinales: datos,
          });
        }
      );
    });
  }
  xmlElegibilidad(arrayValues, os) {
    const date = moment(new Date()).toString();
    const xml =
      `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
          <soap:Header/>
          <soap:Body>
             <tem:ExecuteFileTransactionSL>
                <!--Optional:-->
                <tem:pos></tem:pos>
                <!--Optional:-->
                <tem:fileContent>
                <![CDATA[<?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?><Mensaje><EncabezadoMensaje><VersionMsj>ACT20</VersionMsj><TipoMsj>OL</TipoMsj><TipoTransaccion>01A</TipoTransaccion>
                <IdMsj>123456789</IdMsj>
                <InicioTrx>
                  <FechaTrx>` +
      date +
      `</FechaTrx>
                </InicioTrx><Terminal><TipoTerminal>PC</TipoTerminal><NumeroTerminal>` +
      arrayValues[1] +
      `</NumeroTerminal></Terminal><Financiador><CodigoFinanciador>` +
      os +
      `</CodigoFinanciador></Financiador><Prestador><CuitPrestador>` +
      arrayValues[0] +
      `</CuitPrestador><RazonSocial>?</RazonSocial></Prestador></EncabezadoMensaje><EncabezadoAtencion>
              <Credencial>
        <NumeroCredencial>` +
      arrayValues[3] +
      `</NumeroCredencial>
        <ModoIngreso>M</ModoIngreso>
      </Credencial></EncabezadoAtencion></Mensaje>]]></tem:fileContent></tem:ExecuteFileTransactionSL>
          </soap:Body>
         </soap:Envelope>`;
    return xml;
  }
  xmlAutirizacion(arrayValues, os) {
    console.log(arrayValues);
    const date = moment(new Date(arrayValues[1])).toString();
    const xml =
      `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
          <soap:Header/>
          <soap:Body>
          <tem:ExecuteFileTransactionSL>
            <!--Optional:-->
            <tem:pos></tem:pos>
            <!--Optional:-->
            <tem:fileContent><![CDATA[<?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?>
    <Mensaje>
      <EncabezadoMensaje>
        <VersionMsj>ACT20</VersionMsj>
        <TipoMsj>OL</TipoMsj>
        <TipoTransaccion>02A</TipoTransaccion>
        <IdMsj></IdMsj>
        <InicioTrx>
          <FechaTrx>` +
      date +
      `</FechaTrx>
        </InicioTrx>
        <Terminal>
          <NumeroTerminal>` +
      arrayValues[4] +
      `</NumeroTerminal>
        </Terminal>
        <Financiador>
          <CodigoFinanciador>` +
      os +
      `</CodigoFinanciador>
        </Financiador>
        <Prestador>
          <CuitPrestador>` +
      arrayValues[3] +
      `</CuitPrestador>
          <RazonSocial>?</RazonSocial>
        </Prestador>
      </EncabezadoMensaje>
      <EncabezadoAtencion>
        <Credencial>
          <NumeroCredencial>` +
      arrayValues[5] +
      `</NumeroCredencial>
          <ModoIngreso>M</ModoIngreso>
        </Credencial>
      </EncabezadoAtencion>
      <DetalleProcedimientos>
        <CodPrestacion>475</CodPrestacion>
        <TipoPrestacion>1</TipoPrestacion>
        <CantidadSolicitada>1</CantidadSolicitada>
      </DetalleProcedimientos>
      <DetalleProcedimientos>
        <CodPrestacion>711</CodPrestacion>
        <TipoPrestacion>1</TipoPrestacion>
        <CantidadSolicitada>1</CantidadSolicitada>
      </DetalleProcedimientos>
      <DetalleProcedimientos>
        <CodPrestacion>999999</CodPrestacion>
        <TipoPrestacion>1</TipoPrestacion>
        <CantidadSolicitada>1</CantidadSolicitada>
      </DetalleProcedimientos>
    </Mensaje>]]></tem:fileContent></tem:ExecuteFileTransactionSL>
    </soap:Body>
   </soap:Envelope>`;
    return xml;
  }
}
