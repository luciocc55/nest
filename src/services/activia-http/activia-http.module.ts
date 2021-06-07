import { Module, HttpModule } from "@nestjs/common";
import { ErroresModule } from "../errores/errores.module";
import { ActiviaHttpService } from "./activia-http.service";

@Module({
  imports: [HttpModule, ErroresModule],
  providers: [ActiviaHttpService],
  exports: [ActiviaHttpService],
})
export class ActiviaHttpModule {}
