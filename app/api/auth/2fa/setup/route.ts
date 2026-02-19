import { setup2FA } from '@/controllers/authController';

export async function POST() {
  return setup2FA();
}
