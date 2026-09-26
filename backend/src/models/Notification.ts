import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: 'low_stock' | 'out_of_stock' | 'reorder';
  title: string;
  message: string;
  product?: mongoose.Types.ObjectId;
  warehouse?: mongoose.Types.ObjectId;
  isRead: boolean;
  userId?: mongoose.Types.ObjectId; // null means for all users
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { 
      type: String, 
      enum: ['low_stock', 'out_of_stock', 'reorder'],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    isRead: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
