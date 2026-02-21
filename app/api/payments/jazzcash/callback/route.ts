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

  const orderId = getOrderId(params) ?? params.pp_TxnRef ?? params.pp_BillReference;
  const status = getStatusParam(params) ?? params.pp_ResponseCode;
  const transactionId = (getTransactionId(params) || params.pp_TxnRefNo) ?? orderId ?? '';

  const result = await handleGatewayCallback(
    orderId,
    status,
    transactionId,
    'JazzCash'
  );

  return Response.redirect(result.success ? result.redirectSuccess : result.redirectFailure);
}
