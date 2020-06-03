import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import xmlParser = require('xml2json');
import { DatosElegibilidad } from 'src/interfaces/datos-elegibilidad';

@Injectable()
export class EsencialHttpService {
    url = 'http://ws.medicinaesencial.com.ar/GestosWS/';
    headers = { 'Content-Type': 'text/xml' };
    constructor(
        private readonly httpService: HttpService,
      ) {}
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
