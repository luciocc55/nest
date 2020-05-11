import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  description: {
    type: String,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
});

export const Permissions = auto;
