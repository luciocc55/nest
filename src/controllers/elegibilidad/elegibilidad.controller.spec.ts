import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { AuthService } from "src/services/auth/auth.service";
import { ElegibilidadController } from "./elegibilidad.controller";
import { ElegibilidadModule } from "./elegibilidad.module";
import { LoggingInterceptor } from "src/interceptors/logger/logger.interceptor";
import { OrigenesService } from "src/services/origenes/origenes.service";
describe("ElegibilidadController", () => {
  let elegibilidadController: ElegibilidadController;
  let origenService: OrigenesService;
  const IdTransaccion = "123Test";
  let mockAuth = { getUser: () => "5fa544aa54bc9a0014bc4788" };
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [],
      imports: [AppModule, ElegibilidadModule],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuth)
      .overrideInterceptor(LoggingInterceptor)
      .useValue({})
      .compile();
    elegibilidadController = moduleRef.get<ElegibilidadController>(
      ElegibilidadController
    );
    origenService = moduleRef.get<OrigenesService>(OrigenesService);
  });

  describe("swissTestResponse", () => {
    it("dar aprobada elegibilidad swiss", async (done) => {
      const origen = await origenService.findOneSearch({
        description: "Swiss Medical",
      });
      const body = { origen: origen._id, afiliado: "7218899021083", dni: null };
      const response = await elegibilidadController.list(
        body,
        "",
        IdTransaccion
      );
      expect(response.ElegibilidadRespuesta.IdTransaccion).toEqual(
        IdTransaccion
      );
      expect(response).toHaveProperty("ElegibilidadRespuesta");
      expect(response.ElegibilidadRespuesta.estatus).toBe(1);
      done();
    }, 15000);
  });
  describe("federadaTestResponse", () => {
    it("dar aprobada elegibilidad federada", async (done) => {
      const origen = await origenService.findOneSearch({
        description: "Federada",
      });
      const body = {"origen":origen._id,"dni":"33335858", afiliado: null };
      const response = await elegibilidadController.list(
        body,
        "",
        IdTransaccion
      );
      expect(response.ElegibilidadRespuesta.IdTransaccion).toEqual(
        IdTransaccion
      );
      expect(response).toHaveProperty("ElegibilidadRespuesta");
      expect(response.ElegibilidadRespuesta.estatus).toBe(1);
      done();
    }, 15000);
  });
  describe("esencialTestResponse", () => {
    it("dar aprobada elegibilidad esencial", async (done) => {
      const origen = await origenService.findOneSearch({
        description: "Esencial",
      });
      const body = {"origen":origen._id,"dni":"37714481", afiliado: null };
      const response = await elegibilidadController.list(
        body,
        "",
        IdTransaccion
      );
      expect(response.ElegibilidadRespuesta.IdTransaccion).toEqual(
        IdTransaccion
      );
      expect(response).toHaveProperty("ElegibilidadRespuesta");
      expect(response.ElegibilidadRespuesta.estatus).toBe(1);
      done();
    }, 15000);
  });
  describe("iaposTestResponse", () => {
    it("dar aprobada elegibilidad iapos", async (done) => {
      const origen = await origenService.findOneSearch({
        description: "IAPOS",
      });
      const body = {"origen":origen._id,"dni":null, afiliado: "17070111" };
      const response = await elegibilidadController.list(
        body,
        "",
        IdTransaccion
      );
      expect(response.ElegibilidadRespuesta.IdTransaccion).toEqual(
        IdTransaccion
      );
      expect(response).toHaveProperty("ElegibilidadRespuesta");
      expect(response.ElegibilidadRespuesta.estatus).toBe(1);
      done();
    }, 15000);
  });
  describe("prevencionAMRTestResponse", () => {
    it("dar aprobada elegibilidad prevencion AMR", async (done) => {
      const origen = await origenService.findOneSearch({
        description: "Prevencion Salud (AMR)",
      });
      const body = {"origen":origen._id,"dni":null, afiliado: "587801036" };
      const response = await elegibilidadController.list(
        body,
        "",
        IdTransaccion
      );
      expect(response.ElegibilidadRespuesta.IdTransaccion).toEqual(
        IdTransaccion
      );
      expect(response).toHaveProperty("ElegibilidadRespuesta");
      expect(response.ElegibilidadRespuesta.estatus).toBe(1);
      done();
    }, 15000);
  });
  describe("acaSalurTestResponse", () => {
    it("dar aprobada elegibilidad aca salud", async (done) => {
      const origen = await origenService.findOneSearch({
        description: "ACA Salud",
      });
      const body = {"origen":origen._id,"dni":null, afiliado: "22098410" };
      const response = await elegibilidadController.list(
        body,
        "",
        IdTransaccion
      );
      expect(response.ElegibilidadRespuesta.IdTransaccion).toEqual(
        IdTransaccion
      );
      expect(response).toHaveProperty("ElegibilidadRespuesta");
      expect(response.ElegibilidadRespuesta.estatus).toBe(process.env.Production? 1:0);
      done();
    }, 15000);
  });
  describe("acindarTestResponse", () => {
    it("dar aprobada elegibilidad mutual acindar", async (done) => {
      const origen = await origenService.findOneSearch({
        description: "Mutual Acindar",
      });
      const body = {"origen":origen._id,"dni":null, afiliado: "99" };
      const response = await elegibilidadController.list(
        body,
        "",
        IdTransaccion
      );
      expect(response.ElegibilidadRespuesta.IdTransaccion).toEqual(
        IdTransaccion
      );
      expect(response).toHaveProperty("ElegibilidadRespuesta");
      expect(response.ElegibilidadRespuesta.estatus).toBe(1);
      done();
    }, 20000);
  });
});


