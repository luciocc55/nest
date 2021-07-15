import { Module } from "@nestjs/common";
import { AuthModule } from "src/services/auth/auth.module";
import { LoggerModule } from "src/services/logger/logger.module";
import { PermissionsModule } from "src/services/permissions/permissions.module";
import { ServiciosController } from "./servicios.controller";
import { ServiciosModule } from "src/services/servicios/servicios.module";
@Module({
  controllers: [ServiciosController],
  imports: [PermissionsModule, AuthModule, LoggerModule, ServiciosModule],
})
export class ServiciosControllerModule {}
