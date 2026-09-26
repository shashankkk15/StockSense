import mongoose, { Document, Schema } from 'mongoose';

export interface ITransferItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ITransfer extends Document {
  transferNumber: string;
  sourceWarehouse: mongoose.Types.ObjectId;
  sourceLocation: mongoose.Types.ObjectId;
  destinationWarehouse: mongoose.Types.ObjectId;
  destinationLocation: mongoose.Types.ObjectId;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
  items: ITransferItem[];
  notes?: string;
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transferItemSchema = new Schema<ITransferItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const transferSchema = new Schema<ITransfer>(
  {
    transferNumber: { type: String, required: true, unique: true },
    sourceWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    sourceLocation: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    destinationWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    destinationLocation: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    status: { 
      type: String, 
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft'
    },
    items: { type: [transferItemSchema], required: true, validate: [(val: any[]) => val.length > 0, 'Must have at least one item'] },
    notes: { type: String },
    validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    validatedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

transferSchema.index({ transferNumber: 1 });
transferSchema.index({ status: 1 });
transferSchema.index({ createdAt: -1 });

export const Transfer = mongoose.model<ITransfer>('Transfer', transferSchema);
