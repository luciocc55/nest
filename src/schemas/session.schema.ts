import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

export const Session = auto;
