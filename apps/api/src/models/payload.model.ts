import mongoose, { Document } from 'mongoose';

export interface IPayload extends Document {
  endpointId: mongoose.Types.ObjectId;
  method: string;
  headers: Record<string, unknown>;
  query: Record<string, unknown>;
  body: Record<string, unknown> | string;
  createdAt: Date;
}

const payloadSchema = new mongoose.Schema(
  {
    endpointId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Endpoint',
    },
    method: {
      type: String,
      required: true,
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    query: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

payloadSchema.index({ endpointId: 1, createdAt: -1 });

payloadSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const Payload = mongoose.model<IPayload>('Payload', payloadSchema);
