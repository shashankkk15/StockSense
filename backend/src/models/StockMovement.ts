import mongoose, { Document, Schema } from 'mongoose';

export type MovementType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';

export interface IStockMovement extends Document {
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  movementType: MovementType;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  referenceType: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  referenceId: mongoose.Types.ObjectId;
  referenceNumber?: string;
  reason?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    movementType: { 
      type: String, 
      enum: ['RECEIPT', 'DELIVERY', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'],
      required: true 
    },
    quantity: { type: Number, required: true },
    beforeQuantity: { type: Number, required: true },
    afterQuantity: { type: Number, required: true },
    referenceType: { 
      type: String, 
      enum: ['receipt', 'delivery', 'transfer', 'adjustment'],
      required: true 
    },
    referenceId: { type: Schema.Types.ObjectId, required: true },
    referenceNumber: { type: String },
    reason: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });
stockMovementSchema.index({ performedBy: 1 });
stockMovementSchema.index({ movementType: 1 });
stockMovementSchema.index({ createdAt: -1 });

export const StockMovement = mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
