import { getEnabledPaymentMethods } from '@/lib/payments/config';
import { successResponse } from '@/lib/api-response';

/**
 * Returns which payment methods are enabled (for checkout UI).
 * Does not expose secrets.
 */
export async function GET() {
  const methods = getEnabledPaymentMethods();
  return successResponse({ paymentMethods: methods });
}
