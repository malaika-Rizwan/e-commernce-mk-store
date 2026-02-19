import mongoose, { Schema, Model } from 'mongoose';

export interface ICartItem {
  productId: string;
  slug?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ICart {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    slug: String,
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: String,
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

// user: index created by unique: true on the path

const Cart: Model<ICart> =
  mongoose.models.Cart ?? mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
