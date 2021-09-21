import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { AuthService } from "src/services/auth/auth.service";
import { SwissMedicalHttpService } from "src/services/swiss-medical-http/swiss-medical-http.service";
import { AutorizacionController } from "./autorizacion.controller";
import { AutorizacionModule } from "./autorizacion.module";
import { LoggingInterceptor } from "src/interceptors/logger/logger.interceptor";
import { OrigenesService } from "src/services/origenes/origenes.service";
describe("AutorizacionController", () => {
  let autorizacionController: AutorizacionController;
  let origenService: OrigenesService;
  let cantidad = 0;
  const IdTransaccion = "123Test";
  let mockSwiss = {
    getAutorizacion: () => {
      cantidad = cantidad + 1;
      return { cantidad };
    },
  };
  let mockAuth = { getUser: () => "5fa544aa54bc9a0014bc4788" };
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [],
      imports: [AppModule, AutorizacionModule],
    })
      .overrideProvider(SwissMedicalHttpService)
      .useValue(mockSwiss)
      .overrideProvider(AuthService)
      .useValue(mockAuth)
      .overrideInterceptor(LoggingInterceptor)
      .useValue({})
      .compile();
    autorizacionController = moduleRef.get<AutorizacionController>(
      AutorizacionController
    );
    origenService = moduleRef.get<OrigenesService>(OrigenesService);
  });

  describe("swissTest1Response", () => {
    it("deberia pegarle solo una vez a swiss", async (done) => {
      const origen = await origenService.findOneSearch({
        description: "Swiss Medical",
      });
      const body = {
        facility_id: "25",
        agreement_id: "",
        plan_id: "284",
        atributosAdicionales: ["", "", "0935662021043", "", "MP", "M", "S"],
        paciente: "CASCE,CAMILA             ",
        plan_descripcion: "SMG20 ",
        condicion_iva: "EXENTO",
        prestaciones: [{ codigoPrestacion: "42012201", cantidad: 1 }],
        agreements_practices_plan_id: ["95016"],
        timeStampCliente: "2021-09-15T11:07:32-03:00",
        ambitoPrestacion: "5f771b83bf9b3b001aa99994",
        fechaPrestacion: "2021-09-15T10:17:00-03:00",
        matriculaProfesionalSolicitante: "",
        diagnostico: "",
        referenciaAtencion: "",
        origen: origen._id,
      };
      const response = await autorizacionController.list(
        body,
        "",
        IdTransaccion
      );
      expect(response.AutorizacionRespuesta.IdTransaccion).toEqual(
        IdTransaccion
      );
      expect(response).toHaveProperty("AutorizacionRespuesta");
      expect(response.AutorizacionRespuesta.cantidad).toBeLessThan(2);
      done();
    }, 15000);
  });
});
