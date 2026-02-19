import mongoose, { Schema, Model } from 'mongoose';

export type ContactStatus = 'new' | 'read' | 'replied';

export interface IContact {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
}

export interface IContactDocument extends IContact, mongoose.Document {}

const ContactSchema = new Schema<IContactDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [320, 'Email cannot exceed 320 characters'],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [300, 'Subject cannot exceed 300 characters'],
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [10000, 'Message cannot exceed 10000 characters'],
    },
    status: {
      type: String,
      enum: { values: ['new', 'read', 'replied'], message: 'Status must be new, read, or replied' },
      default: 'new',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1 });

const Contact: Model<IContactDocument> =
  mongoose.models?.Contact ?? mongoose.model<IContactDocument>('Contact', ContactSchema);

export default Contact;
