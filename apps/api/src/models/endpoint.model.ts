import mongoose, { Document } from 'mongoose';
import crypto from 'crypto';
import { Payload } from './payload.model';

const generateUrlId = (): string => crypto.randomBytes(5).toString('hex');

export interface IEndpoint extends Document {
  userId: mongoose.Types.ObjectId;
  urlId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const endpointSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    urlId: {
      type: String,
      required: true,
      unique: true,
      default: generateUrlId,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

endpointSchema.index({ urlId: 1 });

endpointSchema.post('findOneAndDelete', async (doc) => {
  if (doc) {
    await Payload.deleteMany({ endpointId: doc._id });
  }
});

export const Endpoint = mongoose.model<IEndpoint>('Endpoint', endpointSchema);
