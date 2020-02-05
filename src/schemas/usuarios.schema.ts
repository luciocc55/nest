import * as mongoose from 'mongoose';
import { environment } from 'src/env';

// tslint:disable-next-line: no-var-requires
const mongooseFieldEncryption = require('mongoose-field-encryption')
  .fieldEncryption;

const UsuariosSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles',
    autopopulate: true,
  },
});
UsuariosSchema.plugin(require('mongoose-autopopulate'));
UsuariosSchema.plugin(
  mongooseFieldEncryption,
  {
    fields: ['password'],
    secret: environment.secretKey,
  },
);

export const Usuarios = UsuariosSchema;
