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

  const orderId = getOrderId(params) ?? params.reference_id ?? params.order_id;
  const status = getStatusParam(params);
  const transactionId = getTransactionId(params) ?? params.transaction_id ?? orderId ?? '';

  const result = await handleGatewayCallback(
    orderId,
    status,
    transactionId,
    'Safepay'
  );

  return Response.redirect(result.success ? result.redirectSuccess : result.redirectFailure);
}
