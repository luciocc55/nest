import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { SessionService } from '../session/session.service';
import { RedIService } from '../red-i-http/red-i-http.service';

@Processor('AutorizadorQueue')
export class ConsumerService {
  constructor(
    private sessionService: SessionService,
    private redIService: RedIService,
  ) {}

  @Process('sessionRedI')
  async sessionRedI(job: Job<unknown>) {
    const user = await this.sessionService.findAdmin('adminRedI');
    const token = await this.redIService.getToken();
    if (user) {
      user.token = token;
      user.save();
    } else {
      this.sessionService.createAdmin({
        user: 'adminRedI',
        token,
      });
    }
  }
  @Process('practicas')
  async profesionales(job: Job<unknown>) {
    const d = new Date();
    console.log(d, 'Inicio Practicas');
    const array = 'Practicas';
    const [
      practRedI,
    ] = await Promise.all([
      this.redIService.getPracticas(),
    ]);
    console.log(practRedI)
    // const [
    //   profsICR,
    //   profsSP,
    //   profsGO,
    //   profsALG,
    //   profsDMO,
    //   profsGoRed,
    // ] = await Promise.all([
    //   this.serviciosGoService.getProfesionales('icr'),
    //   this.serviciosGoService.getProfesionales('SP'),
    //   this.serviciosGoService.getProfesionales('GO'),
    //   this.serviciosGoService.getProfesionales('algoritmo'),
    //   this.serviciosGoService.getProfesionales('dmo'),
    //   this.goRedService.getProfesionales(),
    // ]);
    //console.log(crea1 + crea2 + crea3 + crea4 + crea5 + crea6);
    const f = new Date();
    console.log(f, 'Fin Practicas');
  }
}
