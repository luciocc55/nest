import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class FederadaHttpService {
    url = 'https://api-test.federada.com/validador/v1.5.3/';
    constructor(
        private readonly httpService: HttpService,
      ) {}
    async elegibilidad(arrayValues): Promise<Observable<any>> {
        const headers = this.getSessionHeaders();
        return this.httpService
          .post(this.url + 'wsvol000/', {p_Prestador: arrayValues[0], p_SubPrestador: arrayValues[1], p_NroDoc: arrayValues[2]}, { headers })
          .pipe(
            map(res => res.data),
            catchError(e => {
              return of({ e });
            }),
          );
      }

      getSessionHeaders() {
        const headers = {
          'x-api-key': `06xeXXOgiq3356caTOOdS4iruZMl0HD72CnYrUnD`,
        };
        return headers;
      }
      getElegibilidad(arrayValues): any {
        return new Promise(async resolve => {
          (await this.elegibilidad(arrayValues)).subscribe(data => {
            let estatus;
            if (data.o_Status === 'SI') {
                estatus = 1;
            } else {
              estatus = 0;
            }
            resolve({data, estatus});
          });
        });
      }
}
