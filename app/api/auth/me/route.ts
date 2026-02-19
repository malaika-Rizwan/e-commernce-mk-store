import { me as meHandler } from '@/controllers/authController';

export async function GET() {
  return meHandler();
}
