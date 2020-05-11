import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  Param,
  Get,
} from '@nestjs/common';

import { LoggingInterceptor } from 'src/interceptors/logger/logger.interceptor';
import { ApiTags } from '@nestjs/swagger';

import { UsersService } from 'src/services/users/users.service';
import { CreateUsers } from 'src/validators/users/createUsers.validator';
import { Users } from 'src/interfaces/users-interfaz';
import { UpdateUsers } from 'src/validators/users/updateUsers.validator';
import { RolesGuard } from 'src/guards/role/role.guard';
import { Search } from 'src/validators/search.validator';
import { Token } from 'src/decorators/token.decorator';
import { AuthService } from 'src/services/auth/auth.service';
import { CreateUsersAtributos } from 'src/validators/users/createUsersAtributos.validator';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService, private authService: AuthService) {}
  @ApiTags('Crea un Usuario con el rol de Normal')
  @UseInterceptors(LoggingInterceptor)
  @Post('create')
  async create(@Body() createdUsuario: CreateUsers): Promise<Users> {
    return await this.usersService.createNormal(createdUsuario);
  }
  @ApiTags('Crea un Usuario con el rol elegido y ademas agregarle atributos al mismo')
  @UseInterceptors(LoggingInterceptor)
  @Post('createRol')
  async createAny(@Body() createdUsuario: CreateUsersAtributos, @Token() token: string): Promise<Users> {
    const priority = await this.authService.getPriority(token);
    const usuario = await this.usersService.createAny(createdUsuario, priority);
    const createdAtributos = await this.usersService.addAtributos(usuario._id, createdUsuario.atributos, priority);
    return createdAtributos;
  }
  @ApiTags('Actualiza los datos de un usuario')
  @UseInterceptors(LoggingInterceptor)
  @Post('update/:id')
  async update(@Body() updateUsuario: UpdateUsers, @Param() params, @Token() token: string): Promise<Users> {
    const priority = await this.authService.getPriority(token);
    const update = await this.usersService.updateUsuario(params.id, updateUsuario, priority);
    return update;
  }
  @ApiTags('Regresa los datos de un usuario')
  @Get('get/:id')
  async get( @Param() params, @Token() token: string): Promise<any> {
    const priority = await this.authService.getPriority(token);
    return await this.usersService.findByIdPopulated(params.id, priority);
  }
  @ApiTags('Lista las cuentas habilitadas')
  @Post('list')
  async list(@Body() search: Search, @Token() token: string): Promise<any> {
    const priority = await this.authService.getPriority(token);
    return await this.usersService.busUsers(search.search, search.cantidad , priority);
  }
}
