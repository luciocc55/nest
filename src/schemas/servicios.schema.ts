import * as mongoose from "mongoose";
const auto = new mongoose.Schema(
  {
    value: { type: String, required: true, unique: true },
    endpoint: { type: String, required: true, unique: true },
  },
  { timestamps: {} }
);

export const Servicios = auto;
