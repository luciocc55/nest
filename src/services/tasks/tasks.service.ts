import { Injectable } from '@nestjs/common';
import { Timeout, Cron, CronExpression } from '@nestjs/schedule';
import environment from 'src/env';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { SessionService } from '../session/session.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OrigenesService } from '../origenes/origenes.service';
import { AtributosEstaticosService } from '../atributos-estaticos/atributos-estaticos.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectQueue('AutorizadorQueue') private readonly queue: Queue,
    private permissionService: PermissionsService,
    private roleService: RolesService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private userService: UsersService,
    private origenesService: OrigenesService,
    private atributosEstaticosService: AtributosEstaticosService,
  ) {}
  //@Cron(CronExpression.EVERY_MINUTE)
  //@Timeout(600)
  async refreshTokenRedICore() {
    const user = await this.sessionService.findAdmin('adminRedI');
    try {
      const decoded = this.jwtService.decode(user.token, { complete: true });
      const now = Date.now();
      const expired =  decoded['payload'].exp * 1000;
      if (now > expired) {
        const job = this.queue.add('sessionRedI', {
          foo: 'AutorizadorQueue',
        });
      }
    } catch (error) {
      const job = this.queue.add('sessionRedI', {
        foo: 'AutorizadorQueue',
      });
    }
  }
  //@Timeout(600)
  //@Cron(CronExpression.EVERY_DAY_AT_1AM)
  async logEsps() {
    const job = this.queue.add('practicas', {
      foo: 'AutorizadorQueue',
    });
  }
  @Timeout(5000)
  createPermissions() {
    environment.permissions.forEach(element => {
      let description = '';
      if (element.description) {
        description = element.description.toString();
      }
      this.permissionService.createPermission({
        description,
        endpoint: element.path,
      });
    });
  }
  @Timeout(5000)
  async createOrigenes() {
    for (const service of environment.orignesPermissions) {
      const origen = await this.origenesService.create(service.origen, service.path);
      service.atributos.forEach((atributo, index) => {
        this.atributosEstaticosService.updateServicios(atributo, service.path, origen._id, index);
      });
    }
  }
  @Timeout(5000)
  async createAdmin() {
    await this.roleService
      .createRole({ description: 'Admin' , priority: 1})
      .catch(error => {});
    await this.roleService
      .createRole({ description: 'Profesional'})
      .catch(error => {});
  }
  @Timeout(6000)
  async createRootAdmin() {
    await this.userService
      .createAdmin(environment.rootAdmin)
      .catch(error => {});
  }
}
