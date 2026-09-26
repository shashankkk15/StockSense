import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

const signToken = (id: string): string => {
  return (jwt as any).sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');

  const userDoc = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: (data.role as 'inventory_manager' | 'warehouse_staff') || 'warehouse_staff',
  });

  const token = signToken((userDoc as any)._id.toString());
  const userObj = (userDoc as any).toObject();
  delete userObj.password;
  return { token, user: userObj };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  if (!user.isActive) throw new AppError('Account has been disabled', 403, 'ACCOUNT_DISABLED');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

  const token = signToken((user as any)._id.toString());
  const userObj = (user as any).toObject();
  delete userObj.password;
  return { token, user: userObj };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('No user found with that email', 404, 'USER_NOT_FOUND');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await User.findByIdAndUpdate((user as any)._id, {
    resetOTP: hashedOTP,
    resetOTPExpiry: expiry,
  });

  console.log(`[DEV] Password reset OTP for ${email}: ${otp}`);
  return { message: 'OTP sent to email', ...(env.NODE_ENV === 'development' && { devOtp: otp }) };
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetOTP: hashedOTP,
    resetOTPExpiry: { $gt: Date.now() },
  }).select('+resetOTP +resetOTPExpiry');

  if (!user) throw new AppError('OTP is invalid or has expired', 400, 'INVALID_OTP');

  user.password = newPassword;
  user.resetOTP = undefined;
  user.resetOTPExpiry = undefined;
  await (user as any).save();

  return { message: 'Password reset successful' };
};

export const updateProfile = async (userId: string, data: { name?: string; phone?: string; avatar?: string }) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return user;
};
