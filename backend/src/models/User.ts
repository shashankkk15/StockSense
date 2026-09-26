import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'inventory_manager' | 'warehouse_staff';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  resetOTP?: string;
  resetOTPExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['inventory_manager', 'warehouse_staff'], default: 'warehouse_staff' },
    phone: { type: String },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    resetOTP: { type: String, select: false },
    resetOTPExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  const doc = this as unknown as IUser;
  if (!doc.isModified('password') || !doc.password) return;
  const salt = await bcrypt.genSalt(12);
  doc.password = await bcrypt.hash(doc.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (this: IUser, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
