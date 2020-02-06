import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  descripcion: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permissions', autopopulate: true }],
});
auto.plugin(require('mongoose-autopopulate'));
export const Roles = auto;
