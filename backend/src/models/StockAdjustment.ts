import mongoose, { Document, Schema } from 'mongoose';

export interface IStockAdjustment extends Document {
  adjustmentNumber: string;
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  recordedQuantity: number;
  countedQuantity: number;
  difference: number;
  reason: string;
  status: 'draft' | 'done' | 'canceled';
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockAdjustmentSchema = new Schema<IStockAdjustment>(
  {
    adjustmentNumber: { type: String, required: true, unique: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    recordedQuantity: { type: Number, required: true },
    countedQuantity: { type: Number, required: true, min: 0 },
    difference: { type: Number, required: true },
    reason: { type: String, required: true, minlength: 5 },
    status: { 
      type: String, 
      enum: ['draft', 'done', 'canceled'],
      default: 'draft'
    },
    validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    validatedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

stockAdjustmentSchema.index({ adjustmentNumber: 1 });
stockAdjustmentSchema.index({ product: 1 });
stockAdjustmentSchema.index({ createdAt: -1 });

export const StockAdjustment = mongoose.model<IStockAdjustment>('StockAdjustment', stockAdjustmentSchema);
