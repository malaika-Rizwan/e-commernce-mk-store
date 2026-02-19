import mongoose, { Schema, Model } from 'mongoose';

export interface IWishlistDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlistDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

WishlistSchema.index({ user: 1, product: 1 }, { unique: true });
// Index on user alone is covered by the compound { user: 1, product: 1 } for queries on user

const Wishlist: Model<IWishlistDocument> =
  mongoose.models.Wishlist ?? mongoose.model<IWishlistDocument>('Wishlist', WishlistSchema);

export default Wishlist;
