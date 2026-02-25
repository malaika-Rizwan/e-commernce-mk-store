import { me as meHandler } from '@/controllers/authController';

export const dynamic = 'force-dynamic';

export async function GET() {
  return meHandler();
}
