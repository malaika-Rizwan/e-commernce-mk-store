import mongoose, { Schema, Model } from 'mongoose';
import type { IProduct, IProductImage } from '@/types';

export interface IProductDocument extends IProduct, mongoose.Document {}

const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, default: '' },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, default: 'Customer' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
      default: undefined,
    },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      trim: true,
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

ProductSchema.pre('save', function (next) {
  if (this.reviews?.length) {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  }
  next();
});

// slug: index created by unique: true on the path
// sku: single sparse index (path has no unique, so define here)
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ sku: 1 }, { sparse: true });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

const Product: Model<IProductDocument> =
  mongoose.models.Product ?? mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
