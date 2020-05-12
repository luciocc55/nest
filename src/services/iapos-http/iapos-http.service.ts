import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import xmlParser = require('xml2json');

@Injectable()
export class IaposHttpService {
    url = 'https://aswe.santafe.gov.ar/proxy.php/iapos/';
    headers = { 'Content-Type': 'text/xml' };
    constructor(
        private readonly httpService: HttpService,
      ) {}
    async elegibilidad(arrayValues): Promise<Observable<any>> {
        const usuario = 'PSICOREDWS';
        const password = 'psico123';
        if (!arrayValues[1]) {
          arrayValues[1] = '?';
        }
        const xml =
        `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:iap="IAPOS_PREPRO.ev2">
        <soapenv:Header/>
        <soapenv:Body>
           <iap:BEWsValidaAfi.Execute>
              <iap:Usuario>` + usuario + `</iap:Usuario>
              <iap:Passwd>` + password + `</iap:Passwd>
              <iap:Nafiliado>` + arrayValues[1] + `</iap:Nafiliado>
              <iap:Badocnumdo>` + arrayValues[0] + `</iap:Badocnumdo>
              <iap:Tidocodigo_de_documento>1</iap:Tidocodigo_de_documento>
              <iap:Ogorcodigo>1</iap:Ogorcodigo>
              <iap:Fechpresta>?</iap:Fechpresta>
           </iap:BEWsValidaAfi.Execute>
        </soapenv:Body>
        </soapenv:Envelope>`;
        return this.httpService
          .post(this.url + 'afiliados/', xml, {headers: this.headers})
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
              if (data['SOAP-ENV:Envelope']['SOAP-ENV:Body']['BEWsValidaAfi.ExecuteResponse']['Estado']['$t'] === 'A') {
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
