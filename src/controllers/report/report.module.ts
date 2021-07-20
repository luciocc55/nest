import { Module } from "@nestjs/common";
import { AuthModule } from "src/services/auth/auth.module";
import { ReportController } from "./report.controller";
import { LoggerModule } from "src/services/logger/logger.module";
import { FunctionsService } from "src/services/functions";
import { UsersServiceModule } from "src/services/users/users.module";

@Module({
  controllers: [ReportController],
  imports: [LoggerModule, AuthModule, UsersServiceModule],
  providers: [FunctionsService],
})
export class ReportModule {}
