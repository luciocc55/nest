import { Injectable, HttpService } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DatosElegibilidad } from 'src/interfaces/datos-elegibilidad';

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
            let datos: DatosElegibilidad;
            if (data.o_Status === 'SI') {
                estatus = 1;
                datos = {
                  nroAfiliado: data.o_GruNro + '0' + data.o_IntNro,
                  nroDocumento: data.o_NroDoc,
                  estadoAfiliado: data.o_Status === 'SI' ? true : false,
                  // tslint:disable-next-line: radix
                  edad: parseInt(data.o_Status),
                  voluntario: data.o_SitFiscal === 'O' ? true : false,
                  fechaNac: data.o_FecNac,
                  plan: data.o_PlanCod,
                  planDescripcion: data.o_PlanDesc,
                  genero: data.o_Sexo === 'M' ? 'Masculino' : 'Femenino',
                  codigoPostal: data.o_CodPos,
                  localidad: data.o_DescLocali,
                  nombreApellido: data.o_Apellido + ',' + data.o_Nombres,
                  servicio: data.o_Status === 'SI' ? true : false,
                  tipoDocumento: data.o_TipDoc ,
                  tipoDocumentoDescripcion: '',
                  recupero: data.o_SitFiscal === 'O' ? true : false,
                };
            } else {
              estatus = 0;
            }
            resolve({ data, estatus, datosFinales: datos });
          });
        });
      }
}
