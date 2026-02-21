import { Types } from 'mongoose';

export interface IUserAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IUserAddressFull {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  address?: IUserAddress;
  addresses?: IUserAddressFull[];
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'user' | 'admin';

export interface IReview {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IProductImage {
  url: string;
  public_id: string;
}

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  /** Array of { url, public_id }. Legacy products may have been stored as string[]; normalize when reading. */
  images: IProductImage[];
  category: string;
  features?: string[];
  stock: number;
  sku?: string;
  featured?: boolean;
  salesCount?: number;
  tags?: string[];
  brand?: string;
  reviews?: IReview[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  /** First product image URL for display */
  image?: string;
}

export type OrderStatus = 'pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'cancelled';

export interface IOrder {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  orderId?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    email?: string;
  };
  stripeSessionId?: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  discountAmount?: number;
  couponCode?: string;
  totalPrice: number;
  orderStatus?: OrderStatus;
  status?: OrderStatus;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CartItem = {
  productId: string;
  slug?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
};
