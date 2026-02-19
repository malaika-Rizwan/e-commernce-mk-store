import { logout as logoutHandler } from '@/controllers/authController';

export async function POST() {
  return logoutHandler();
}
