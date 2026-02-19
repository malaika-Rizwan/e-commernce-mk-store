import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

/**
 * Example admin-only route. Middleware already ensures only admin role can reach this.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await connectDB();
    const users = await User.find({})
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return successResponse({ users });
  } catch (err) {
    console.error('Admin users list error:', err);
    return serverErrorResponse();
  }
}
