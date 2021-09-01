import { HttpModule, Module } from "@nestjs/common";
import { ErroresModule } from "../errores/errores.module";
import { AcindarHttpService } from "./acindar-http.service";

@Module({
  imports: [HttpModule, ErroresModule],
  providers: [AcindarHttpService],
  exports: [AcindarHttpService],
})
export class AcindarttpModule {}
