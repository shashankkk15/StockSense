import mongoose, { Document, Schema } from 'mongoose';

export interface IStock extends Document {
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const stockSchema = new Schema<IStock>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

stockSchema.index({ product: 1, warehouse: 1, location: 1 }, { unique: true });
stockSchema.index({ product: 1 });
stockSchema.index({ warehouse: 1 });

export const Stock = mongoose.model<IStock>('Stock', stockSchema);
