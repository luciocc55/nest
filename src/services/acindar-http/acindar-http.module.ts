import { HttpModule, Module } from "@nestjs/common";
import { AcindarHttpService } from "./acindar-http.service";

@Module({
  imports: [HttpModule],
  providers: [AcindarHttpService, ],
  exports: [AcindarHttpService],
})
export class AcindarttpModule {}
