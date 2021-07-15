import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Servicios } from "src/schemas/servicios.schema";
import { ServiciosService } from "./servicios.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Servicios", schema: Servicios }]),
  ],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}
