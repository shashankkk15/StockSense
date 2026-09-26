import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  warehouse: mongoose.Types.ObjectId;
  type: 'rack' | 'shelf' | 'bin' | 'production' | 'staging' | 'other';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, minlength: 2, trim: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    type: { 
      type: String, 
      enum: ['rack', 'shelf', 'bin', 'production', 'staging', 'other'],
      required: true
    },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationSchema.index({ warehouse: 1, name: 1 }, { unique: true });

export const Location = mongoose.model<ILocation>('Location', locationSchema);
