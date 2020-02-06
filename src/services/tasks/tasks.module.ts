import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  providers: [TasksService],
  exports: [TasksService],
  imports: [PermissionsModule, RolesModule],
})
export class TasksModule {}
