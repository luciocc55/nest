import { HttpModule, Module } from "@nestjs/common";
import { AuthModule } from "src/services/auth/auth.module";
import { EsquemasModule } from "src/services/esquemas/esquemas.module";
import { LoggerModule } from "src/services/logger/logger.module";
import { OrigenesModule } from "src/services/origenes/origenes.module";
import { ServiciosModule } from "src/services/servicios/servicios.module";
import { EsquemasController } from "./esquemas.controller";

@Module({
  controllers: [EsquemasController],
  imports: [
    AuthModule,
    LoggerModule,
    HttpModule,
    EsquemasModule,
    OrigenesModule,
    ServiciosModule,
  ],
})
export class EsquemasControllerModule {}
