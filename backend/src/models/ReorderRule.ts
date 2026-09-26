import mongoose, { Document, Schema } from 'mongoose';

export interface IReorderRule extends Document {
  product: mongoose.Types.ObjectId;
  minStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reorderRuleSchema = new Schema<IReorderRule>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    minStock: { type: Number, required: true, min: 0 },
    reorderLevel: { type: Number, required: true, min: 0 },
    reorderQuantity: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ReorderRule = mongoose.model<IReorderRule>('ReorderRule', reorderRuleSchema);
