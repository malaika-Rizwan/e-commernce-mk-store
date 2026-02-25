import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return unauthorizedResponse();

    await connectDB();
    const messages = await Contact.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const list = messages.map((m) => ({
      _id: m._id.toString(),
      name: m.name,
      email: m.email,
      subject: m.subject ?? '',
      message: m.message,
      status: m.status,
      createdAt: m.createdAt,
    }));

    return successResponse({ messages: list });
  } catch (err) {
    console.error('Admin messages list error:', err);
    return serverErrorResponse();
  }
}
