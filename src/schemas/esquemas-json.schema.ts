import * as mongoose from "mongoose";
const Definiciones = new mongoose.Schema({
  valorEntrada: {
    type: String,
    required: true,
  },
  valorSalida: {
    type: String,
    required: true,
  },
});

const Keys = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  definiciones: [Definiciones],
  keyRelacionada: {
    type: String,
    required: true,
  },
});
const auto = new mongoose.Schema(
  {
    origen: { type: mongoose.Schema.Types.ObjectId, ref: "Origenes" },
    sinonimoOrigen: {
      type: String,
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    servicio: { type: mongoose.Schema.Types.ObjectId, ref: "Servicios" },
    keys: [Keys],
    json: {
      type: String,
      required: true,
    },
  },
  { timestamps: {} }
);

export const Esquemas = auto;
