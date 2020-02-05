import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  request: {
    type: String,
    required: true,
  },
  resonse: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
  },
  cliente: {
    type: String,
    required: true,
  },
  fecha: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  usuario: {
    type: String,
    required: true,
  },
});

export const Logger = auto;
