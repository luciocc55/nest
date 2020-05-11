import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import xmlParser = require('xml2json');

@Injectable()
export class EsencialHttpService {
    url = 'http://ws.medicinaesencial.com.ar/GestosWSTest/';
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
            try {
              if (data['SOAP-ENV:Envelope']['SOAP-ENV:Body']['PSOC063.ExecuteResponse']['Sdtvalidacionsocio']['SINEdo'] === 'AC') {
                estatus = 1;
              } else {
                estatus = 0;
              }
            } catch (error) {
              estatus = 0;
            }
            resolve({data, estatus});
          });
        });
      }
}
