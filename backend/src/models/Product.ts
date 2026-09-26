import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: mongoose.Types.ObjectId;
  unitOfMeasure: 'unit' | 'kg' | 'liter' | 'meter' | 'box' | 'pack' | 'piece';
  description?: string;
  totalStock: number;
  minStockThreshold?: number;
  reorderLevel?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, minlength: 2, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    unitOfMeasure: { 
      type: String, 
      enum: ['unit', 'kg', 'liter', 'meter', 'box', 'pack', 'piece'],
      required: true 
    },
    description: { type: String },
    totalStock: { type: Number, default: 0, min: 0 },
    minStockThreshold: { type: Number, min: 0 },
    reorderLevel: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', sku: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);
