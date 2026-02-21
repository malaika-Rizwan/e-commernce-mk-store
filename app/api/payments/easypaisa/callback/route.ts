import { NextRequest } from 'next/server';
import {
  handleGatewayCallback,
  getOrderId,
  getStatusParam,
  getTransactionId,
} from '@/lib/payments/callbackHandler';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(
    Array.from(searchParams.entries()).map(([k, v]) => [k, v])
  ) as Record<string, string | null>;

  const orderId = getOrderId(params);
  const status = getStatusParam(params);
  const transactionId = getTransactionId(params);

  const result = await handleGatewayCallback(
    orderId,
    status,
    transactionId,
    'Easypaisa'
  );

  return Response.redirect(result.success ? result.redirectSuccess : result.redirectFailure);
}
