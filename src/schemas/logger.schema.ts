import * as mongoose from 'mongoose';

const auto = new mongoose.Schema({
  body: {
    type: String,
  },
  params: {
    type: String,
  },
  query: {
    type: String,
  },
  response: {
    type: String,
  },
  ip: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
},
{ timestamps: { createdAt: "created" } }
);

export const Logger = auto;
