import mongoose, { Schema, Model } from 'mongoose';

export interface ICouponDocument extends mongoose.Document {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, uppercase: true, trim: true, unique: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, min: 0, default: undefined },
    maxUses: { type: Number, min: 0, default: undefined },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: undefined },
  },
  { timestamps: true }
);

// code: index created by unique: true on the path

const Coupon: Model<ICouponDocument> =
  mongoose.models.Coupon ?? mongoose.model<ICouponDocument>('Coupon', CouponSchema);

export default Coupon;
