import mongoose, { Schema, Model } from 'mongoose';
import type { IOrder, OrderStatus } from '@/types';

export interface IOrderDocument extends IOrder, mongoose.Document {}

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, required: true, default: 'stripe' },
    paymentResult: {
      id: String,
      status: String,
      email: String,
    },
    stripeSessionId: { type: String, sparse: true },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrderDocument> =
  mongoose.models.Order ?? mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
