import { Injectable } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { environment } from 'src/env';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class TasksService {
  constructor(
    private permissionService: PermissionsService,
    private roleService: RolesService,
  ) {}
  @Timeout(5000)
  createPermissions() {
    environment.permissions.forEach(element => {
      let descripcion = '';
      if (element.descripcion) {
        descripcion = element.descripcion.toString();
      }
      this.permissionService.createPermission({
        descripcion,
        endpoint: element.path,
      });
    });
  }
  @Timeout(5000)
  async createAdmin() {
    await this.roleService
      .createRole({ descripcion: 'Admin' })
      .catch(error => {});
  }
}
