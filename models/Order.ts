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

const ORDER_STATUSES = ['pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'cancelled'] as const;

const OrderSchema = new Schema<IOrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, unique: true, sparse: true },
    trackingNumber: { type: String, sparse: true },
    estimatedDelivery: { type: Date },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String },
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Processing',
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
// orderId and trackingNumber already have indexes via unique:true / sparse:true in schema

function generateOrderId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `MK-${num}`;
}

function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < 12; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

function getEstimatedDeliveryDate(): Date {
  const days = 3 + Math.floor(Math.random() * 5);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function assignOrderIds(order: IOrderDocument): Promise<void> {
  let orderId = order.orderId ?? generateOrderId();
  let exists = await mongoose.models.Order?.exists?.({ orderId, _id: { $ne: order._id } });
  while (exists) {
    orderId = generateOrderId();
    exists = await mongoose.models.Order?.exists?.({ orderId, _id: { $ne: order._id } });
  }
  order.orderId = orderId;
  order.trackingNumber = order.trackingNumber ?? generateTrackingNumber();
  order.estimatedDelivery = order.estimatedDelivery ?? getEstimatedDeliveryDate();
  order.orderStatus = (order.orderStatus as string) || 'Processing';
}

const Order: Model<IOrderDocument> =
  mongoose.models.Order ?? mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
