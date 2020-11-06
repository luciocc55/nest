import { Injectable, HttpService } from '@nestjs/common';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import xmlParser = require('xml2json');
import { DatosElegibilidad } from 'src/interfaces/datos-elegibilidad';

@Injectable()
export class EsencialHttpService {
    url;
    headers = { 'Content-Type': 'text/xml' };
    constructor(
        private readonly httpService: HttpService,
      ) {
        if (process.env.Production === 'true') {
          this.url = 'http://ws.medicinaesencial.com.ar/GestosWS/';
        } else {
          this.url = 'http://ws.medicinaesencial.com.ar/GestOSWSTest/';
        }
      }
      async autorizar(arrayValues, prestacion, cantidadPrestacion): Promise<Observable<any>> {
        const xml =
        `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ges="GestOS">
        <soapenv:Header/>
        <soapenv:Body>
           <ges:PSAW003.Execute>
              <ges:Sdtsolicitudautorizacionweb>
                 <ges:SocCod>` + arrayValues[1] + `</ges:SocCod>
                 <ges:SINCod>?</ges:SINCod>
                 <ges:SINAyN>?</ges:SINAyN>
                 <ges:SAWGRPCod>?</ges:SAWGRPCod>
                 <ges:SAWGRPNom>?</ges:SAWGRPNom>
                 <ges:SAWEdo>?</ges:SAWEdo>
                 <ges:SAWMotRec>?</ges:SAWMotRec>
                 <ges:SAWNroAut>?</ges:SAWNroAut>
                 <ges:SINNroDoc>` + arrayValues[2] + `</ges:SINNroDoc>
                 <ges:SAWPorCob>?</ges:SAWPorCob>
                 <ges:SAWImpCop>?</ges:SAWImpCop>
                 <ges:SAWPRSCod>` + prestacion + `</ges:SAWPRSCod>
                 <ges:SAWPRSNom>?</ges:SAWPRSNom>
                 <ges:SAWFec>?</ges:SAWFec>
                 <ges:SocCodSINCod>?</ges:SocCodSINCod>
                 <ges:PRVCod>` + arrayValues[0] + `</ges:PRVCod>
                 <ges:SAWTSOCod>?</ges:SAWTSOCod>
                 <ges:SAWTSODsc>?</ges:SAWTSODsc>
                 <ges:SAWPLanMatInf>?</ges:SAWPLanMatInf>
                 <ges:SAWPorCos>?</ges:SAWPorCos>
                 <ges:SAWImpCos>?</ges:SAWImpCos>
                 <ges:SAWStuTip>?</ges:SAWStuTip>
                 <ges:SAWConsFec>` + arrayValues[6] + `</ges:SAWConsFec>
                 <ges:SAWConPRFEfe>?</ges:SAWConPRFEfe>
                 <ges:SAWConPRFNomEfe>?</ges:SAWConPRFNomEfe>
                 <ges:SAWConPRFSol>?</ges:SAWConPRFSol>
                 <ges:SAWConPRFNomSol>?</ges:SAWConPRFNomSol>
                 <ges:SAWPRFMatEfe>` + arrayValues[3] + `</ges:SAWPRFMatEfe>
                 <ges:SAWPRFMatSol>` + arrayValues[4] + `</ges:SAWPRFMatSol>
                 <ges:SAWPRSCan>` + cantidadPrestacion + `</ges:SAWPRSCan>
                 <ges:SAWPlaCod>?</ges:SAWPlaCod>
                 <ges:SAWPlaNom>?</ges:SAWPlaNom>
                 <ges:SAWFac>?</ges:SAWFac>
                 <ges:SAWPrsVal>?</ges:SAWPrsVal>
                 <ges:SAWCntOcu>?</ges:SAWCntOcu>
                 <ges:SAWAuxN1>?</ges:SAWAuxN1>
                 <ges:SAWAuxN2>?</ges:SAWAuxN2>
                 <ges:SAWAuxN3>?</ges:SAWAuxN3>
                 <ges:SAWAuxC1>?</ges:SAWAuxC1>
                 <ges:SAWAuxC2>?</ges:SAWAuxC2>
                 <ges:SAWAuxC3>?</ges:SAWAuxC3>
                 <ges:SAWAuxD1>?</ges:SAWAuxD1>
                 <ges:SAWAuxD2>?</ges:SAWAuxD2>
                 <ges:SAWAuxD3>?</ges:SAWAuxD3>
              </ges:Sdtsolicitudautorizacionweb>
           </ges:PSAW003.Execute>
        </soapenv:Body>
        </soapenv:Envelope>`;
        return this.httpService
          .post(this.url + 'apsaw003.aspx?wsdl/', xml, {headers: this.headers})
          .pipe(
            map(res => xmlParser.toJson(res.data, {object: true})),
            catchError(e => {
              return of({ e });
            }),
          );
      }
    async elegibilidad(arrayValues): Promise<Observable<any>> {
        const xml =
        `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ges="GestOS">
        <soapenv:Header/>
        <soapenv:Body>
           <ges:PSOC063.Execute>
              <ges:Sdtvalidacionsocio>
                 <ges:SocCodSINCod>` + arrayValues[2] + `</ges:SocCodSINCod>
                 <ges:SINNroDoc>` + arrayValues[1] + `</ges:SINNroDoc>
                 <ges:SINAyN>?</ges:SINAyN>
                 <ges:PRVCod>` + arrayValues[0] + `</ges:PRVCod>
                 <ges:PRVNom>?</ges:PRVNom>
                 <ges:GRPCod>?</ges:GRPCod>
                 <ges:GRPNom>?</ges:GRPNom>
                 <ges:SINEdo>?</ges:SINEdo>
                 <ges:TSOCod>?</ges:TSOCod>
                 <ges:SINFchVig>?</ges:SINFchVig>
                 <ges:TSODsc>?</ges:TSODsc>
                 <ges:SOCFchEdo>?</ges:SOCFchEdo>
                 <ges:SAWEdo>?</ges:SAWEdo>
                 <ges:SAWMotRec>?</ges:SAWMotRec>
                 <ges:SocCod>?</ges:SocCod>
                 <ges:SINCod>?</ges:SINCod>
                 <ges:SAWNroAut>?</ges:SAWNroAut>
                 <ges:PMI>?</ges:PMI>
              </ges:Sdtvalidacionsocio>
           </ges:PSOC063.Execute>
        </soapenv:Body>
        </soapenv:Envelope>`;
        return this.httpService
          .post(this.url + 'apsoc063.aspx?wsdl/', xml, {headers: this.headers})
          .pipe(
            map(res => xmlParser.toJson(res.data, {object: true})),
            catchError(e => {
              return of({ e });
            }),
          );
      }
      getAutorizacion(arrayValues, origen): any {
        return new Promise(async resolve => {
          const subscriptions = [];
          if (arrayValues[5]) {
            arrayValues[5].forEach(async element => {
              subscriptions.push(await this.autorizar(arrayValues, element.codigoPrestacion, element.cantidad));
            });
            forkJoin(subscriptions).subscribe(data => {
              resolve(data);
            });
          } else {
            return {};
          }

        });
      }
      getElegibilidad(arrayValues): any {
        return new Promise(async resolve => {
          (await this.elegibilidad(arrayValues)).subscribe(data => {
            let estatus;
            let datos: DatosElegibilidad;
            try {
              const info = data['SOAP-ENV:Envelope']['SOAP-ENV:Body']['PSOC063.ExecuteResponse']['Sdtvalidacionsocio'];
              if (info['SINEdo'] === 'AC') {
                estatus = 1;
                datos = {
                  nroAfiliado: info['SocCodSINCod'],
                  nroDocumento: info['SINNroDoc'],
                  estadoAfiliado: info['SINEdo'] === 'AC' ? true : false,
                  // tslint:disable-next-line: radix
                  edad: 0,
                  voluntario: info['TSODsc'] === 'Voluntario' ? true : false,
                  fechaNac: '',
                  plan: info['GRPCod'],
                  planDescripcion: info['GRPNom'],
                  genero: '',
                  codigoPostal: '',
                  localidad: '',
                  nombreApellido: info['SINAyN'],
                  servicio: null,
                  tipoDocumento: '',
                  tipoDocumentoDescripcion: '',
                  recupero: null,
                };
              } else {
                estatus = 0;
              }
            } catch (error) {
              estatus = 0;
            }
            resolve({ data, estatus, datosFinales: datos });
          });
        });
      }
}
