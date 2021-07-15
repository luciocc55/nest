import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Esquemas } from "src/schemas/esquemas-json.schema";
import { EsquemasService } from "./esquemas.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Esquemas", schema: Esquemas }]),
  ],
  providers: [EsquemasService],
  exports: [EsquemasService],
})
export class EsquemasModule {}
