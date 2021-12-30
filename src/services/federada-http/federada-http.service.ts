import { Injectable, HttpService } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { DatosElegibilidad } from "src/interfaces/datos-elegibilidad";
import { RespuestaHttp } from "src/interfaces/respuesta-http";
import { ErroresService } from "../errores/errores.service";
import { FunctionsService } from "../functions";

@Injectable()
export class FederadaHttpService {
  url;
  constructor(private readonly httpService: HttpService,private functionService: FunctionsService,private erroresService: ErroresService) {
    if (process.env.Production === 'true') {
      this.url = 'https://api.federada.com/validador/v1.5.4/';
    } else {
      this.url = 'https://api-test.federada.com/validador/v1.5.4/';
    }

  }
  
  async elegibilidad(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = this.getSessionHeaders();
    const url = this.url + "wsvol000/";
    const body = {
      p_Prestador: arrayValues[0],
      p_SubPrestador: arrayValues[1],
      p_NroDoc: arrayValues[2],
    };
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

  getSessionHeaders() {
    const headers = {
      "x-api-key": `06xeXXOgiq3356caTOOdS4iruZMl0HD72CnYrUnD`,
    };
    return headers;
  }

  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        let estatus;
        let dataHttp = data.data;
        let datos: DatosElegibilidad = new DatosElegibilidad();
        let datosTasy: any = {
          "MotivoRechazo" : "",
          EstadoIntegrante : 'I'
        }
        if (dataHttp.o_Status === "SI") {
          datosTasy.NroAfiliado = dataHttp.o_GruNro + "0" + dataHttp.o_IntNro;
          datosTasy.EstadoIntegrante = 'A';
          datosTasy.NombreApellido = dataHttp.o_Apellido + "," + dataHttp.o_Nombres;
          estatus = 1;
          datos = {
            nroAfiliado: dataHttp.o_GruNro + "0" + dataHttp.o_IntNro,
            nroDocumento: dataHttp.o_NroDoc,
            estadoAfiliado: dataHttp.o_Status === "SI" ? true : false,
            // tslint:disable-next-line: radix
            edad: parseInt(dataHttp.o_Status),
            voluntario: dataHttp.o_SitFiscal === "O" ? true : false,
            fechaNac: dataHttp.o_FecNac,
            plan: dataHttp.o_PlanCod,
            planDescripcion: dataHttp.o_PlanDesc,
            genero: dataHttp.o_Sexo === "M" ? "Masculino" : "Femenino",
            codigoPostal: dataHttp.o_CodPos,
            localidad: dataHttp.o_DescLocali,
            nombreApellido: dataHttp.o_Apellido + "," + dataHttp.o_Nombres,
            servicio: dataHttp.o_Status === "SI" ? true : false,
            tipoDocumento: dataHttp.o_TipDoc,
            tipoDocumentoDescripcion: "",
            recupero: dataHttp.o_SitFiscal === "O" ? true : false,
          };
        } else {
          estatus = 0;
        }
        resolve({
          data: dataHttp,
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

  async autorizacion(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = this.getSessionHeaders();
    const dateToday = this.functionService.returnDateFormat3(new Date());
    const date = this.functionService.returnDateFormatFrom(arrayValues[1]);
    const prestaciones = arrayValues[0].map((current,cont ) => {
        return {
        NroLinea: cont,
        PstCod:current.codigoPrestacion,
        Cantidad:current.cantidad,
        PtiCod:"1",
        DesDiagno:arrayValues[11]
        };}
      );

    const body = {
      p_PreCUIT: arrayValues[3],
      p_SubPreCUIT:arrayValues[4],
      p_Modo: arrayValues[5]||"A",
      p_TipDoc: arrayValues[6] ? parseInt(arrayValues[6]) : 1,
      p_NroDoc: arrayValues[7],
      p_SopValida: 2,
      p_TokenComp: arrayValues[10],
      p_StrIde:"", 
      p_ProCUITAct:arrayValues[6],
      p_PreLmtPre: arrayValues[8],
      p_PreNmtPre: arrayValues[2],
      p_FecPrescrip:arrayValues[9],
      p_Archivos:[],
      p_ListaPrestaciones:prestaciones
    };
    const url = this.url + "wsvol001/";
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


  getAutorizacion(arrayValues,origen): any {
    return new Promise(async (resolve) => {
      (await this.autorizacion(arrayValues)).subscribe(async (data) => {
        let estatus;
        let resultados = [];
        let error;
        let numeroTransaccion = null;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        const dataHttp = data.data;
        let datosTasy: any = {
          Estado: false
        }

        if (dataHttp.o_ListaPrestacionesValidadas) {
          let codigo=dataHttp.o_Comentario.substring(1,3);
          let status_T=dataHttp.o_StatusT;
          resultados = dataHttp.o_ListaPrestacionesValidadas.map((data, index) => {
            let estado;
            let estado_prestacion=data.Comentario.substring(1,3)
            if ((estado_prestacion==="526")||(estado_prestacion==="000")||(estado_prestacion==="500")) {
              estado = true;
            } else {
              estado = false;
            }
            return {
              prestación: arrayValues[0][index].codigoPrestacion,
              CodigoPrestacion:arrayValues[0][index].codigoPrestacion,
              transaccion: data.NroAutorizacion,
              mensaje: data.Comentario,
              cantidad: data.Cantidad,
              Cantidad: data.Cantidad,
              Rechazadas: arrayValues[1][index]-data.Cantidad,
              rechazadas: arrayValues[1][index]-data.Cantidad,
              copago: data.PoseeCopCos?data.ComentCopCos:0,
              Copago: data.PoseeCopCos?data.ComentCopCos:0,
              Estado: estado? 'A': 'R',
              estado,
            };
          });
          if (status_T==='B000') {
            estatus = 1;
            datosTasy.Estado = true;
            datosTasy.Prestaciones = resultados;
            datosTasy.NroAtención = dataHttp.o_NroSolicitud;
            numeroTransaccion = dataHttp.o_NroSolicitud;
            } else {
              const err = await this.erroresService.findOne({
                "values.value": codigo,
                "values.origen": origen,
              });
              datosTasy.Error = 0;
              datosTasy.MotivoRechazo = dataHttp.o_Comentario;
              if (err) {
                errorEstandarizado = err.description;
                errorEstandarizadoCodigo = err.valueStandard;
                datosTasy.Error = err.valueStandard;
                datosTasy.MotivoRechazo =  err.description;
              }
              estatus = 0;
              error = dataHttp.o_Comentario;}
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

  async cancelarAutorizacion(arrayValues): Promise<Observable<RespuestaHttp>> {
    const headers = await this.getSessionHeaders();
    const dateToday = this.functionService.returnDateFormat3(new Date());
    const url = this.url + "wsvolas1/";
    const body = {
      p_NroSolicitud:arrayValues[0],
      p_PreCUIT: arrayValues[1],
      p_SubPreCUIT:arrayValues[2],
     };
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

  getCancelarAutorizacion(arrayValues, origen): any {
    return new Promise(async (resolve) => {
      (await this.cancelarAutorizacion(arrayValues)).subscribe(async (data) => {
        let estatus;
        let error;
        let numeroTransaccion = null;
        let errorEstandarizado = null;
        let errorEstandarizadoCodigo = null;
        let dataHttp = data.data;
        let datosTasy: any = {
          Estado: false,
        }
        if (dataHttp.o_Status) {
          if (dataHttp.o_Status === 'OK') {
            estatus = 1;
            numeroTransaccion = dataHttp.envio.p_NroSolicitud;
            datosTasy.NroAtención = dataHttp.envio.p_NroSolicitud;
          } else {
            const err = await this.erroresService.findOne({
              "values.value": dataHttp.o_Status,
              "values.origen": origen,
            });
            datosTasy.MotivoRechazo = dataHttp.o_Status;
            if (err) {
              datosTasy.MotivoRechazo = dataHttp.o_Comentario;
              errorEstandarizado = err.description;
              errorEstandarizadoCodigo = err.valueStandard;
            }
            estatus = 0;
            error = dataHttp.o_Comentario;
          }
        } else {
          estatus = 0;
          datosTasy.MotivoRechazo = "Por favor, intente nuevamente";
          error = "Por favor, intente nuevamente";
        }

        resolve({
          data: dataHttp,
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
}
