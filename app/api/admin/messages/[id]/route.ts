import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  errorResponse,
} from '@/lib/api-response';
import type { ContactStatus } from '@/models/Contact';

const VALID_STATUSES: ContactStatus[] = ['new', 'read', 'replied'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return unauthorizedResponse();

    const { id } = await params;
    if (!id) return notFoundResponse('Message not found');

    await connectDB();
    const doc = await Contact.findById(id).lean();
    if (!doc) return notFoundResponse('Message not found');

    return successResponse({
      message: {
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        subject: doc.subject ?? '',
        message: doc.message,
        status: doc.status,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    console.error('Admin message get error:', err);
    return serverErrorResponse();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return unauthorizedResponse();

    const { id } = await params;
    if (!id) return notFoundResponse('Message not found');

    const body = await request.json().catch(() => null);
    const status = typeof body?.status === 'string' ? body.status : undefined;
    if (!status || !VALID_STATUSES.includes(status as ContactStatus)) {
      return errorResponse('Invalid status. Use: new, read, replied', 400);
    }

    await connectDB();
    const doc = await Contact.findByIdAndUpdate(
      id,
      { status: status as ContactStatus },
      { new: true }
    ).lean();
    if (!doc) return notFoundResponse('Message not found');

    return successResponse({
      message: {
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        subject: doc.subject ?? '',
        message: doc.message,
        status: doc.status,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    console.error('Admin message patch error:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return unauthorizedResponse();

    const { id } = await params;
    if (!id) return notFoundResponse('Message not found');

    await connectDB();
    const doc = await Contact.findByIdAndDelete(id);
    if (!doc) return notFoundResponse('Message not found');

    return successResponse({ deleted: true });
  } catch (err) {
    console.error('Admin message delete error:', err);
    return serverErrorResponse();
  }
}
