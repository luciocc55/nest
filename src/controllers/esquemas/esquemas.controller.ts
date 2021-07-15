import {
  Controller,
  UseGuards,
  UseInterceptors,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpException,
  Req,
  HttpService,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Token } from "src/decorators/token.decorator";
import { RolesGuard } from "src/guards/role/role.guard";
import { LoggingInterceptor } from "src/interceptors/logger/logger.interceptor";
import { AuthService } from "src/services/auth/auth.service";
import { EsquemasService } from "src/services/esquemas/esquemas.service";
import { OrigenesService } from "src/services/origenes/origenes.service";
import { ServiciosService } from "src/services/servicios/servicios.service";
import { CrearEsquema } from "src/validators/esquemas/crearEsquema.validator";
import { UsarServicio } from "src/validators/esquemas/serviciosRequest.validator";
const flatten = require("flat");

@Controller("esquemas")
@UseGuards(RolesGuard)
export class EsquemasController {
  constructor(
    private esquemasService: EsquemasService,
    private origenesService: OrigenesService,
    private serviciosService: ServiciosService,
    private authService: AuthService,
    private httpService: HttpService
  ) {}
  @ApiTags("Crea un esquema")
  @UseInterceptors(LoggingInterceptor)
  @Post("create")
  async create(
    @Body() createEsquema: CrearEsquema,
    @Token() token: string
  ): Promise<any> {
    const user = await this.authService.getUser(token);
    const created = this.esquemasService.create({
      ...createEsquema,
      user: user,
    });
    return created;
  }
  @ApiTags("Devuelve un esquema")
  @Get("/:id")
  async get(@Param() params): Promise<any> {
    return this.esquemasService.findId(params.id);
  }
  @ApiTags("Devuelve todos los esquemas")
  @Get("")
  async getAll(): Promise<any> {
    return this.esquemasService.findAll({});
  }
  @ApiTags("Cambia un esquema")
  @UseInterceptors(LoggingInterceptor)
  @Post("update/:id")
  async update(
    @Body() createEsquema: CrearEsquema,
    @Param() params
  ): Promise<any> {
    return this.esquemasService.update(params.id, createEsquema);
  }
  @ApiTags("Redirije a un esquema")
  @UseInterceptors(LoggingInterceptor)
  @Post("servicios")
  async redirect(
    @Body() esquemaEntrada: any,
    @Query() qparams: UsarServicio,
    @Token() token,
    @Req() request
  ): Promise<any> {
    const user = await this.authService.getUser(token);
    const [servicio, origen] = await Promise.all([
      this.serviciosService.findOneSearch({ value: qparams.servicio }),
      this.origenesService.findOneSearch({ description: qparams.os }),
    ]);
    if (!servicio || !origen) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "Parametros no encontrados",
        },
        400
      );
    }
    const esquema = await this.esquemasService.find({
      user: user,
      servicio: servicio._id,
      origen: origen._id,
    });
    if (!esquema) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "No existe esquema para estos parametros",
        },
        400
      );
    }
    let bodyEnvio: any = {};
    try {
      const keys = esquema.keys;
      keys.forEach((element) => {
        let keyEntrada = element.key;
        const keySalida = element.keyRelacionada;
        if (keyEntrada.includes("x") || keySalida.includes("x")) {
          bodyEnvio = {
            ...bodyEnvio,
            ...this.keysFromArray(
              keyEntrada,
              keySalida,
              esquemaEntrada,
              element.definiciones
            ),
          };
        } else {
          bodyEnvio[keySalida] = this.valueFromKeys(
            keyEntrada,
            esquemaEntrada,
            element.definiciones
          );
        }
      });
      bodyEnvio = flatten.unflatten({ ...bodyEnvio });
    } catch (error) {
      bodyEnvio = esquemaEntrada;
    }
    bodyEnvio.origen = origen._id;
    switch (qparams.servicio) {
      case "elegibilidad":
        return this.getValueRequest(
          request.protocol +
            "://" +
            request.headers.host +
            "/autorizador/elegibilidad/consultar/",
          bodyEnvio,
          request.headers
        );

        break;
      case "autorizar":
        return this.getValueRequest(
          request.protocol +
            "://" +
            request.headers.host +
            "/autorizador/autorizacion/autorizar/",
          bodyEnvio,
          request.headers
        );

        break;
    }
    return {};
  }
  async getRequest(url, body, headers): Promise<Observable<any>> {
    return this.httpService.post(url, body, { headers }).pipe(
      map((res) => res.data),
      catchError((e) => {
        return of({ e });
      })
    );
  }
  getValueRequest(url, body, headers) {
    return new Promise(async (resolve) => {
      (await this.getRequest(url, body, headers)).subscribe((data) => {
        resolve(data);
      });
    });
  }
  valueFromKeys(keys, data, definiciones) {
    let value = null;
    let keep = true;
    let counter = 1;
    const splittedKey = keys.split(".");
    let body = data[splittedKey[0]];
    value = body;
    while (keep && splittedKey.length > 1) {
      if (counter !== 1) {
        body = body[splittedKey[counter - 1]];
        if (splittedKey.length === counter) {
          value = body;
          keep = false;
        }
      }
      counter++;
    }
    const existDef = this.returnExistDef(definiciones, value);
    if (existDef) {
      return existDef.valorSalida;
    }
    return value;
  }
  returnExistDef(definiciones, value) {
    const existDef = definiciones.find(
      (def) =>
        def.valorEntrada === value ||
        parseInt(def.valorEntrada) === value ||
        parseInt(value) === def.valorEntrada
    );
    return existDef;
  }
  keysFromArray(key, keyRelacionada, data, definiciones) {
    let body = {};
    const splittedKey = key.split(".");
    const firstXRelacion = keyRelacionada.indexOf("x");
    let primerRelacion = keyRelacionada;
    let ultimaRelacion = keyRelacionada;
    if (firstXRelacion !== -1) {
      primerRelacion = keyRelacionada.slice(0, [firstXRelacion - 2]);
      ultimaRelacion = keyRelacionada.slice(
        [firstXRelacion + 2],
        keyRelacionada.length
      );
    }
    const firstXKey = splittedKey.findIndex((item) => item === "x");
    const flatted = flatten({ ...data[splittedKey[firstXKey - 1]] });
    const keysFlatted = Object.keys(flatted);
    const existe = splittedKey
      .slice([firstXKey + 1], splittedKey.length)
      .join(".");
    keysFlatted
      .filter((item) => item.slice(2, item.length) === existe)
      .forEach((element) => {
        const existDef = this.returnExistDef(definiciones, flatted[element]);
        body[primerRelacion] = {
          ...body[primerRelacion],
          [firstXRelacion !== -1 ? ultimaRelacion : element]: existDef
            ? existDef.valorSalida
            : flatted[element],
        };
      });
    return body;
  }
}
