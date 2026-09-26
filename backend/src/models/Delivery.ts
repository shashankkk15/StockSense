import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryItem {
  product: mongoose.Types.ObjectId;
  requestedQuantity: number;
  pickedQuantity?: number;
  packedQuantity?: number;
}

export interface IDelivery extends Document {
  deliveryNumber: string;
  customer?: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
  items: IDeliveryItem[];
  notes?: string;
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryItemSchema = new Schema<IDeliveryItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  requestedQuantity: { type: Number, required: true, min: 1 },
  pickedQuantity: { type: Number, min: 0 },
  packedQuantity: { type: Number, min: 0 },
}, { _id: false });

const deliverySchema = new Schema<IDelivery>(
  {
    deliveryNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    status: { 
      type: String, 
      enum: ['draft', 'waiting', 'ready', 'done', 'canceled'],
      default: 'draft'
    },
    items: { type: [deliveryItemSchema], required: true, validate: [(val: any[]) => val.length > 0, 'Must have at least one item'] },
    notes: { type: String },
    validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    validatedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

deliverySchema.index({ deliveryNumber: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ customer: 1 });
deliverySchema.index({ createdAt: -1 });

export const Delivery = mongoose.model<IDelivery>('Delivery', deliverySchema);
