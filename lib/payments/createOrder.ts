/**
 * Shared order creation for gateway checkouts. Validates cart, applies coupon, creates unpaid order.
 * Used by /api/checkout/jazzcash, easypaisa, safepay, card.
 */
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order, { assignOrderIds } from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import type { CreateCheckoutSessionInput } from '@/lib/validations/checkout';
import type { IOrderDocument } from '@/models/Order';

const SHIPPING_FLAT = 10;
const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.1;

export interface CreateOrderResult {
  order: IOrderDocument;
  unavailableIds?: string[];
}

export interface CreateOrderError {
  status: 400 | 404;
  message: string;
  unavailableProductIds?: string[];
}

export async function createOrderForGateway(
  userId: string,
  parsed: CreateCheckoutSessionInput,
  paymentMethod: string
): Promise<CreateOrderResult | CreateOrderError> {
  await connectDB();

  const { shippingAddress, items: cartItems, couponCode } = parsed;
  const orderItems: Array<{
    product: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }> = [];
  let itemsPrice = 0;
  const unavailableIds: string[] = [];

  for (const item of cartItems) {
    if (!item.productId?.trim()) {
      return { status: 400, message: 'Product ID missing' };
    }
    const productId = item.productId.trim();
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return { status: 400, message: `Invalid product ID: ${productId}` };
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      unavailableIds.push(productId);
      continue;
    }
    if (product.stock < item.quantity) {
      return {
        status: 400,
        message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
      };
    }
    itemsPrice += product.price * item.quantity;
    orderItems.push({
      product: product._id.toString(),
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      image:
        typeof product.images?.[0] === 'string'
          ? product.images[0]
          : product.images?.[0]?.url,
    });
  }

  if (unavailableIds.length > 0) {
    return {
      status: 400,
      message:
        'Some products are no longer available. Please remove them from your cart and try again.',
      unavailableProductIds: unavailableIds,
    };
  }

  if (orderItems.length === 0) {
    return { status: 400, message: 'No valid items to order' };
  }

  let discountAmount = 0;
  let appliedCouponCode: string | undefined;
  if (couponCode?.trim()) {
    const coupon = await Coupon.findOne({
      code: couponCode.trim().toUpperCase(),
    }).lean();
    if (coupon) {
      const now = new Date();
      const valid =
        (!coupon.expiresAt || now <= new Date(coupon.expiresAt)) &&
        (coupon.maxUses == null || coupon.usedCount < coupon.maxUses);
      const subtotal = itemsPrice;
      const minOk = coupon.minOrder == null || subtotal >= coupon.minOrder;
      if (valid && minOk) {
        if (coupon.type === 'percent') {
          discountAmount =
            Math.round((subtotal * Math.min(coupon.value, 100)) / 100 * 100) / 100;
        } else {
          discountAmount = Math.min(coupon.value, subtotal);
          discountAmount = Math.round(discountAmount * 100) / 100;
        }
        appliedCouponCode = coupon.code;
      }
    }
  }

  const subtotal = itemsPrice;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const totalPrice = Math.max(
    0,
    Math.round((subtotal + shipping + tax - discountAmount) * 100) / 100
  );

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: subtotal,
    shippingPrice: shipping,
    taxPrice: tax,
    discountAmount: discountAmount > 0 ? discountAmount : undefined,
    couponCode: appliedCouponCode,
    totalPrice,
    isPaid: false,
    isDelivered: false,
    status: 'pending',
    orderStatus: 'Processing',
  });
  await assignOrderIds(order);
  await order.save();

  return { order };
}
