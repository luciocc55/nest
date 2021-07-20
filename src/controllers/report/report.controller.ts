import { Controller, Post, Body, UseGuards, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "src/guards/role/role.guard";
import { Token } from "src/decorators/token.decorator";
import { AuthService } from "src/services/auth/auth.service";
import { GetReporte } from "src/validators/report.validator";
import { LoggerService } from "src/services/logger/logger.service";
import { Request } from "express";
import { FunctionsService } from "src/services/functions";
import { UsersService } from "src/services/users/users.service";
import moment = require('moment');

@Controller("report")
@UseGuards(RolesGuard)
export class ReportController {
  constructor(
    private authService: AuthService,
    private loggerService: LoggerService,
    private functionsService: FunctionsService,
    private usersService: UsersService
  ) {}
  @ApiTags("Trae el reporte de uso de servicios")
  @Post("list")
  async list(
    @Body() search: GetReporte,
    @Token() token: string,
    @Req() request: Request
  ): Promise<any> {
    const priority = await this.authService.getPriority(token);
    const string = this.functionsService.returnRegex(search.busqueda);
    const roles = (await this.usersService.getRoles(priority)).map(
      (item) => item._id
    );
    const usersQuery: any = {
      $and: [{ role: roles }],
    };
    if (search.user) {
      usersQuery.$and.push({ $regex: search.user });
    }
    const users = (await this.usersService.findAllSearch(usersQuery)).map(
      (item) => item.user
    );
    const query: any = {
      $and: [
        {
          $or: [
            {
              body: [string, search.origen],
            },
            {
              response: string,
            },
          ],
        },
        {
          user: users,
        },
      ],
    };
    if (search.fechaDesde || search.fechaHasta) {
      const fecF = moment(search.fechaHasta).utcOffset("+00:00");
      const fecI = moment(search.fechaDesde).utcOffset("+00:00");
      query.$and.push({
        date: {
          $gte: new Date(Date.UTC(fecF.year(),fecF.month(),fecF.date(),fecF.hours(),fecF.minutes(),fecF.seconds())),
          $lt: new Date(Date.UTC(fecI.year(),fecI.month(),fecI.date(),fecI.hours(),fecI.minutes(),fecI.seconds())),
        },
      });
    }
    if (search.url) {
      query.$and.push({
        url: { $regex: search.url },
      });
    }

    return await this.loggerService.reporte(query, request);
  }
}
