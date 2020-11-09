import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DatosElegibilidad } from 'src/interfaces/datos-elegibilidad';
import xmlParser = require('xml2json');
@Injectable()
export class AcaHttpService {
    url = 'https://cauat.acasalud.com.ar:443/SSCaws/Servicios.wsdl';
    headers = { 'Content-Type': 'text/xml'};
    constructor(private readonly httpService: HttpService) {}
    async elegibilidad(arrayValues): Promise<Observable<any>> {
      const usuario = '7021871';
      const password = 'DAT_MGR';
      if (!arrayValues[1]) {
        arrayValues[1] = '?';
      }
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
            <USRID>` + usuario + `</USRID>
            <USRPASS>` + password + `</USRPASS>
        </SEGURIDAD>
        <OPER>
            <TIPO>ELG</TIPO>
            <IDASEG>ACA_SALUD</IDASEG>
            <IDPRESTADOR>` + arrayValues[0] + `</IDPRESTADOR>
            <FECHA>2020-11-05</FECHA>
        </OPER>
        <PID>
            <TIPOID>CODIGO</TIPOID>
            <ID>` + arrayValues[2] + `</ID>
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
      return this.httpService
        .post(this.url , xml, { headers: this.headers })
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
          console.log(data)
          
          resolve({ data});
        });
      });
    }
}