import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import xmlParser = require('xml2json');
import { DatosElegibilidad } from 'src/interfaces/datos-elegibilidad';

@Injectable()
export class IaposHttpService {
  url = 'https://aswe.santafe.gov.ar/iapos-sw-srvt/servlet/';
  headers = { 'Content-Type': 'text/xml' };
  constructor(private readonly httpService: HttpService) {}
  async elegibilidad(arrayValues): Promise<Observable<any>> {
    const usuario = 'PSICOREDWS';
    const password = 'psico123';
    if (!arrayValues[1]) {
      arrayValues[1] = '?';
    }
    const xml =
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:iap="IAPOS_WS">
        <soapenv:Header/>
        <soapenv:Body>
           <iap:BEWsValidaAfi.Execute>
              <iap:Usuario>` +
      usuario +
      `</iap:Usuario>
              <iap:Passwd>` +
      password +
      `</iap:Passwd>
              <iap:Nafiliado>` +
      arrayValues[1] +
      `</iap:Nafiliado>
              <iap:Badocnumdo>` +
      arrayValues[0] +
      `</iap:Badocnumdo>
              <iap:Tidocodigo_de_documento>1</iap:Tidocodigo_de_documento>
              <iap:Ogorcodigo>1</iap:Ogorcodigo>
              <iap:Fechpresta>?</iap:Fechpresta>
           </iap:BEWsValidaAfi.Execute>
        </soapenv:Body>
        </soapenv:Envelope>`;
    return this.httpService
      .post(this.url + 'abewsvalidaafi?wsdl', xml, { headers: this.headers })
      .pipe(
        map((res) => xmlParser.toJson(res.data, { object: true })),
        catchError((e) => {
          return of({ e });
        }),
      );
  }
  getElegibilidad(arrayValues): any {
    return new Promise(async (resolve) => {
      (await this.elegibilidad(arrayValues)).subscribe((data) => {
        const info =
          data['SOAP-ENV:Envelope']['SOAP-ENV:Body'][
            'BEWsValidaAfi.ExecuteResponse'
          ];
        let estatus;
        let datos: DatosElegibilidad = new DatosElegibilidad();
        try {
          if (info['Estado']['$t'] === 'A') {
            estatus = 1;
            datos = {
              nroAfiliado: info['Nafiliado']['$t'],
              nroDocumento: info['Badocnumdo']['$t'].substr(1),
              estadoAfiliado: info['Estado']['$t'] === 'A' ? true : false,
              // tslint:disable-next-line: radix
              edad: parseInt(info['Edad']['$t']),
              voluntario: null,
              fechaNac: info['Fechanac']['$t'],
              plan: '',
              planDescripcion: '',
              genero: info['Sexo']['$t'] === '1' ? 'Masculino' : 'Femenino',
              codigoPostal: info['Codpos']['$t'],
              localidad: info['Localidad']['$t'],
              nombreApellido: info['Apenom']['$t'],
              servicio: info['Servicio']['$t'] === 'S' ? true : false,
              tipoDocumento: info['Tidocodigo_de_documento']['$t'],
              tipoDocumentoDescripcion: info['Tidodescri_documento']['$t'],
              recupero: ['Recupero']['$t'] === 'S' ? true : false,
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
