import mongoose, { Document, Schema } from 'mongoose';

export interface IReceiptItem {
  product: mongoose.Types.ObjectId;
  expectedQuantity: number;
  receivedQuantity?: number;
}

export interface IReceipt extends Document {
  receiptNumber: string;
  supplier?: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
  items: IReceiptItem[];
  notes?: string;
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const receiptItemSchema = new Schema<IReceiptItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  expectedQuantity: { type: Number, required: true, min: 1 },
  receivedQuantity: { type: Number, min: 0 },
}, { _id: false });

const receiptSchema = new Schema<IReceipt>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    status: { 
      type: String, 
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft'
    },
    items: { type: [receiptItemSchema], required: true, validate: [(val: any[]) => val.length > 0, 'Must have at least one item'] },
    notes: { type: String },
    validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    validatedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

receiptSchema.index({ receiptNumber: 1 });
receiptSchema.index({ status: 1 });
receiptSchema.index({ supplier: 1 });
receiptSchema.index({ createdAt: -1 });

export const Receipt = mongoose.model<IReceipt>('Receipt', receiptSchema);
