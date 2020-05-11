import { Injectable, HttpService } from '@nestjs/common';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { SessionService } from '../session/session.service';
import environment from 'src/env';

@Injectable()
export class RedIService {
  constructor(
    private readonly httpService: HttpService,
    private sessionService: SessionService,
  ) {}
  private async Token() {
    return this.httpService
      .post(environment.urlBaseRedI + 'token', {
        email: 'brunof@kozaca.com.ar',
        password: 'd@d*Z/Yp3k^a[K^2',
      })
      .pipe(
        map(res => res.data.token),
        catchError(e => {
          return of(null);
        }),
      );
  }
  getToken(): any {
    return new Promise(async resolve => {
      (await this.Token()).subscribe(data => {
        resolve(data);
      });
    });
  }

  async getSessionHeaders() {
    const usuario = await this.sessionService.findAdmin('adminRedI');
    const headers = {
      'Content-Type': 'application/json',
      'Autorizacion': `Bearer ${usuario.token}`,
    };
    return headers;
  }

  async practicas(): Promise<Observable<any>> {
    const headers = await this.getSessionHeaders();
    return this.httpService
      .post(environment.urlBaseRedI + 'getPracticas', {}, { headers })
      .pipe(
        map(res => res.data),
        catchError(e => {
          return of({ Practicas: [] });
        }),
      );
  }

  getPracticas(): any {
    return new Promise(async resolve => {
      (await this.practicas()).subscribe(data => {
        try {
          const result = data.resultados.map(practica => ({ idOrigen: practica.practicaId, descripcion: practica.nombre }));
          resolve({Practicas: result});
        } catch (error) {
          resolve({Practicas: []});
        }
      });
    });
  }

}
