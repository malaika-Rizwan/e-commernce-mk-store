import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { IUser } from '@/types';

export interface IUserDocument extends IUser, mongoose.Document {
  comparePassword(candidate: string): Promise<boolean>;
  getResetPasswordToken(): string;
  clearResetPasswordToken(): Promise<void>;
  getVerificationToken(): string;
  setVerificationCode(): Promise<string>;
  compareVerificationCode(plainCode: string): Promise<boolean>;
  clearVerificationToken(): Promise<void>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: undefined,
    },
    phone: {
      type: String,
      trim: true,
      default: undefined,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    addresses: [
      {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpire: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });
UserSchema.index({ verificationToken: 1 }, { sparse: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.getResetPasswordToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return token;
};

UserSchema.methods.clearResetPasswordToken = async function (): Promise<void> {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpire = undefined;
  await this.save({ validateBeforeSave: false });
};

const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours (link)
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes (OTP code)

UserSchema.methods.getVerificationToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verificationTokenExpires = new Date(Date.now() + VERIFICATION_EXPIRY_MS);
  return token;
};

/** Generate 6-digit OTP, store bcrypt hash in DB, expiry 10 min. Returns plain code for email. Call after getVerificationToken(). */
UserSchema.methods.setVerificationCode = async function (): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 100000–999999
  const hashed = await bcrypt.hash(code, 10);
  this.verificationCode = hashed;
  this.verificationCodeExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  (this as { otp?: string; otpExpire?: Date }).otp = hashed;
  (this as { otpExpire?: Date }).otpExpire = new Date(Date.now() + OTP_EXPIRY_MS);
  return code;
};

/** Compare plain OTP with stored hash. Use for email verification and OTP verify. */
UserSchema.methods.compareVerificationCode = function (plainCode: string): Promise<boolean> {
  const stored = this.verificationCode;
  if (!stored || typeof stored !== 'string') return Promise.resolve(false);
  return bcrypt.compare(plainCode, stored);
};

UserSchema.methods.clearVerificationToken = async function (): Promise<void> {
  this.verificationToken = undefined;
  this.verificationTokenExpires = undefined;
  this.verificationCode = undefined;
  this.verificationCodeExpires = undefined;
  (this as { otp?: string; otpExpire?: Date }).otp = undefined;
  (this as { otpExpire?: Date }).otpExpire = undefined;
  this.isVerified = true;
  await this.save({ validateBeforeSave: false });
};

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', UserSchema);

export default User;
