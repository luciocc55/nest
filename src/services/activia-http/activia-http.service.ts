import { HttpService, Injectable } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import xmlParser = require("xml2json");
import moment = require("moment");
import { ErroresService } from "../errores/errores.service";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
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
  async elegibilidad(arrayValues, os): Promise<Observable<RespuestaHttp>> {
    const xml = this.xmlElegibilidad(arrayValues, os);
    return this.httpService
      .post(this.url, xml, {
        headers: this.headers,
      })
      .pipe(
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
  async autorizacion(arrayValues, os): Promise<Observable<RespuestaHttp>> {
    const xml = this.xmlAutirizacion(arrayValues, os);
    return this.httpService
      .post(this.url, xml, {
        headers: this.headers,
      })
      .pipe(
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
  getElegibilidadOSPDC(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues, "PATCAB")).subscribe((data) => {
        const datosParseados = xmlParser.toJson(
          data?.data["soap:Envelope"]["soap:Body"][
            "ExecuteFileTransactionSLResponse"
          ]["ExecuteFileTransactionSLResult"],
          { object: true }
        );
        let datos: DatosElegibilidad = new DatosElegibilidad();
        let datosTasy: any = {
          NroAfiliado: arrayValues[3],
          MotivoRechazo: "",
          EstadoIntegrante: "I",
        };
        let estatus;
        try {
          if (
            datosParseados.Mensaje?.EncabezadoMensaje?.Rta.CodRtaGeneral ===
            "00"
          ) {
            estatus = 1;
            datosTasy.EstadoIntegrante = "A";
            datosTasy.NombreApellido =
              datosParseados.Mensaje?.EncabezadoAtencion?.Beneficiario?.NombreBeneficiario;
            datos.voluntario = datosParseados.Mensaje?.EncabezadoAtencion?.Credencial?.CondicionIVA === 'G' ? true: false
          } else {
            estatus = 0;
          }
        } catch (error) {
          estatus = 0;
        }
        resolve({
          data: datosParseados,
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
  getAutorizacionOSPDC(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(arrayValues, "PATCAB")).subscribe(
        async (data) => {
          const datosParseados = xmlParser.toJson(
            data?.data["soap:Envelope"]["soap:Body"][
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
          let datosTasy: any = {
            Estado: false,
          };
          if (datosParseados.EncabezadoMensaje) {
            if (datosParseados.EncabezadoMensaje.Rta?.CodRtaGeneral === "00") {
              estatus = 1;
              if (!Array.isArray(datosParseados.DetalleProcedimientos)) {
                datosParseados.DetalleProcedimientos = [
                  datosParseados.DetalleProcedimientos,
                ];
              }
              datosTasy.Estado = true;
              datosTasy.NroAtención = datosParseados.EncabezadoMensaje.NroReferencia;
              resultados = datosParseados.DetalleProcedimientos?.map(
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
              numeroTransaccion = datosParseados.EncabezadoMensaje.NroReferencia;
            } else {
              const err = await this.erroresService.findOne({
                "values.value": datosParseados.EncabezadoMensaje.Rta?.CodRtaGeneral.toString(),
                "values.origen": origen,
              });
              datosTasy.Error = 0;
              datosTasy.MotivoRechazo = datosParseados.EncabezadoMensaje.Rta?.DescripcionRtaGeneral;
              if (err) {
                errorEstandarizado = err.description;
                errorEstandarizadoCodigo = err.valueStandard;
                datosTasy.Error = err.valueStandard;
                datosTasy.MotivoRechazo = err.description;
              }
              estatus = 0;
              error =
                datosParseados.EncabezadoMensaje.Rta?.DescripcionRtaGeneral;
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
            data: datosParseados,
            resultado: datos,
            ...datosTasy,
            datosFinales: datos,
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
          });
        }
      );
    });
  }
  async cancelarTransaccion(
    arrayValues,
    os
  ): Promise<Observable<RespuestaHttp>> {
    const xml = this.xmlCancelacion(arrayValues, os);
    return this.httpService
      .post(this.url, xml, {
        headers: this.headers,
      })
      .pipe(
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
  getCancelarAutorizacionOSPDC(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.cancelarTransaccion(arrayValues, "PATCAB")).subscribe(
        async (datos) => {
          const data = xmlParser.toJson(
            datos?.data["soap:Envelope"]["soap:Body"][
              "ExecuteFileTransactionSLResponse"
            ]["ExecuteFileTransactionSLResult"],
            { object: true }
          )?.Mensaje;
          let estatus;
          let error;
          let numeroTransaccion = null;
          let errorEstandarizado = null;
          let errorEstandarizadoCodigo = null;
          if (data.EncabezadoMensaje) {
            if (data.EncabezadoMensaje.Rta?.CodRtaGeneral === "00") {
              estatus = 1;
              numeroTransaccion = data.EncabezadoMensaje.NroReferencia;
            } else {
              const err = await this.erroresService.findOne({
                "values.value": data.EncabezadoMensaje.Rta?.CodRtaGeneral.toString(),
                "values.origen": origen,
              });
              if (err) {
                errorEstandarizado = err.description;
                errorEstandarizadoCodigo = err.valueStandard;
              }
              estatus = 0;
              error = data.EncabezadoMensaje.Rta?.DescripcionRtaGeneral;
            }
          } else {
            estatus = 0;
            error = "Por favor, intente nuevamente";
          }
          resolve({
            estatus,
            envio: data.envio,
            params: data.params,
            url: data.url,
            headers: data.headers,
            data,
            resultado: {
              estatus,
              errorEstandarizado,
              numeroTransaccion,
              errorEstandarizadoCodigo,
              error,
            },
          });
        }
      );
    });
  }
  xmlCancelacion(arrayValues, os) {
    const date = moment(new Date());
    const fecha = date.format("YYYYMMDD");
    const hora = date.format("HHmmss");
    const xml =
      `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/"><soap:Header/><soap:Body><tem:ExecuteFileTransactionSL><!--Optional:--><tem:pos></tem:pos><!--Optional:--><tem:fileContent><![CDATA[<?xml version="1.0" encoding="utf-8"?><Mensaje><EncabezadoMensaje><VersionMsj>ACT20</VersionMsj><NroReferenciaCancel>` +arrayValues[0] +`</NroReferenciaCancel><TipoMsj>OL</TipoMsj><TipoTransaccion>04A</TipoTransaccion><IdMsj/><InicioTrx><FechaTrx>` +fecha +`</FechaTrx><HoraTrx>` +hora +`</HoraTrx></InicioTrx><Terminal><TipoTerminal>PC</TipoTerminal><NumeroTerminal>` + arrayValues[2]+`</NumeroTerminal></Terminal><Validador/><Financiador><CodigoFinanciador>` +os +`</CodigoFinanciador></Financiador><Prestador><CuitPrestador>` +arrayValues[1] +`</CuitPrestador></Prestador></EncabezadoMensaje></Mensaje>]]></tem:fileContent></tem:ExecuteFileTransactionSL></soap:Body></soap:Envelope>`;
    return xml;
  }
  xmlElegibilidad(arrayValues, os) {
    const date = moment(new Date());
    const fecha = date.format("YYYYMMDD");
    const hora = date.format("HHmmss");
    const xml =
      `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
          <soap:Header/>
          <soap:Body>
             <tem:ExecuteFileTransactionSL>
                <!--Optional:-->
                <tem:pos></tem:pos>
                <!--Optional:-->
                <tem:fileContent><![CDATA[<?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?><Mensaje><EncabezadoMensaje><VersionMsj>ACT20</VersionMsj><TipoMsj>OL</TipoMsj><TipoTransaccion>01A</TipoTransaccion>
                <IdMsj>123456789</IdMsj>
                <InicioTrx>
                  <FechaTrx>` +
      fecha +
      `</FechaTrx>
      <HoraTrx>` +
      hora +
      `</HoraTrx>
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
    const date = moment(new Date(arrayValues[1]));
    const fecha = date.format("YYYYMMDD");
    const hora = date.format("HHmmss");
    const prestaciones = arrayValues[0].map((item) => {
      return (
        `
      <DetalleProcedimientos>
        <CodPrestacion>` +
        item.codigoPrestacion +
        `</CodPrestacion>
        <TipoPrestacion>1</TipoPrestacion>
        <CantidadSolicitada>` +
        item.cantidad +
        `</CantidadSolicitada>
      </DetalleProcedimientos>
      `
      );
    });
    const xml =
      `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
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
      fecha +
      `</FechaTrx>
        <HoraTrx>` +
      hora +
      `</HoraTrx>
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
    ` +
      prestaciones.join("") +
      `
    </Mensaje>]]></tem:fileContent></tem:ExecuteFileTransactionSL>
    </soap:Body>
   </soap:Envelope>`;
    return xml;
  }
}
