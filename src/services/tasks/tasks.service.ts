import { Injectable } from "@nestjs/common";
import { Timeout, Cron, CronExpression } from "@nestjs/schedule";
import environment from "src/env";
import { PermissionsService } from "../permissions/permissions.service";
import { RolesService } from "../roles/roles.service";
import { SessionService } from "../session/session.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { OrigenesService } from "../origenes/origenes.service";
import { AtributosEstaticosService } from "../atributos-estaticos/atributos-estaticos.service";
import { ExtrasService } from "../extras/extras.service";
import { SinonimosService } from "../sinonimos/sinonimos.service";
import { ErroresService } from "../errores/errores.service";
import { ServiciosService } from "../servicios/servicios.service";

@Injectable()
export class TasksService {
  extras = ["Ambitos de Prestaciones"];
  sinonimos = [
    [
      { description: "Ambulatorio", defaultValue: "A" },
      { description: "Internacion", defaultValue: "I" },
    ],
  ];
  servicios = [
    { value: "elegibilidad", endpoint: "/elegibilidad/consultar" },
    { value: "autorizar", endpoint: "autorizacion/autorizar" },
  ];
  constructor(
    @InjectQueue("AutorizadorQueue") private readonly queue: Queue,
    private permissionService: PermissionsService,
    private roleService: RolesService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private userService: UsersService,
    private origenesService: OrigenesService,
    private extrasService: ExtrasService,
    private sinonimosService: SinonimosService,
    private atributosEstaticosService: AtributosEstaticosService,
    private erroresService: ErroresService,
    private serviciosService: ServiciosService
  ) {}
  //@Cron(CronExpression.EVERY_MINUTE)
  //@Timeout(600)
  async refreshTokenRedICore() {
    const user = await this.sessionService.findAdmin("adminRedI");
    try {
      const decoded = this.jwtService.decode(user.token, { complete: true });
      const now = Date.now();
      const expired = decoded["payload"].exp * 1000;
      if (now > expired) {
        const job = this.queue.add("sessionRedI", {
          foo: "AutorizadorQueue",
        });
      }
    } catch (error) {
      const job = this.queue.add("sessionRedI", {
        foo: "AutorizadorQueue",
      });
    }
  }
  //@Timeout(600)
  //@Cron(CronExpression.EVERY_DAY_AT_1AM)
  async logEsps() {
    const job = this.queue.add("practicas", {
      foo: "AutorizadorQueue",
    });
  }
  @Timeout(5000)
  createPermissions() {
    environment.permissions.forEach((element) => {
      let description = "";
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
      const origen = await this.origenesService.create(
        service.origen,
        service.path
      );
      service.atributos.forEach(async (atributo, index) => {
        await this.atributosEstaticosService.updateServicios(
          atributo.atributo,
          atributo.isEntry,
          atributo.isOptional,
          service.path,
          origen._id,
          index
        );
      });
    }
  }
  @Timeout(5000)
  async createErroresSwiss() {
    const origen = await this.origenesService.findOneSearch({
      description: "Swiss Medical",
    });
    const err = await Promise.all([
      this.erroresService.getOrCreate("1", "La autorizaci??n requiere token"),
      this.erroresService.getOrCreate("2", "El token es incorrecto"),
      this.erroresService.getOrCreate("3", "Hubo un error en la transaccion"),
      this.erroresService.getOrCreate('4', 'Afiliado inexistente')
    ]);
    const values = await Promise.all([
      this.erroresService.pushValue("1", "148", origen._id),
      this.erroresService.pushValue("2", "149", origen._id),
      this.erroresService.pushValue("4", "35", origen._id),
    ]);
  }

  @Timeout(5000)
  async createErroresFederada() {
    const origen = await this.origenesService.findOneSearch({
      description: "Federada",
    });
    const err = await Promise.all([
      this.erroresService.getOrCreate("1", "La autorizaci??n requiere token"),
      this.erroresService.getOrCreate("2", "El token es incorrecto"),
      this.erroresService.getOrCreate("3", "Hubo un error en la transaccion"),
      this.erroresService.getOrCreate('4', 'Afiliado inexistente')
    ]);
    const values = await Promise.all([
      this.erroresService.pushValue("1", "228", origen._id),
      this.erroresService.pushValue("2", "226", origen._id),
      this.erroresService.pushValue("2", "229", origen._id),
      this.erroresService.pushValue("2", "230", origen._id),
      this.erroresService.pushValue("4", "215", origen._id),
      this.erroresService.pushValue("4", "212", origen._id),
    ]);
  }


  @Timeout(5000)
  async createExtras() {
    for (const extra of this.extras) {
      await this.extrasService.getOrCreate(extra);
    }
  }

  @Timeout(7000)
  async createSinonimos() {
    for (const [index, extra] of this.extras.entries()) {
      const extraM = await this.extrasService.findOne({ description: extra });
      const sin = this.sinonimos[index];
      for (const sinonimo of sin) {
        await this.sinonimosService.getOrCreate(
          sinonimo.description,
          sinonimo.defaultValue,
          extraM._id
        );
      }
    }
  }
  @Timeout(7000)
  async createServicios() {
    for (const servicio of this.servicios) {
      const newServicio = await this.serviciosService.create(servicio);
    }
  }
  @Timeout(5000)
  async createAdmin() {
    await this.roleService
      .createRole({ description: "Admin", priority: 1 })
      .catch((error) => {});
    await this.roleService
      .createRole({ description: "Profesional" })
      .catch((error) => {});
  }
  @Timeout(6000)
  async createRootAdmin() {
    await this.userService
      .createAdmin(environment.rootAdmin)
      .catch((error) => {});
  }
}
