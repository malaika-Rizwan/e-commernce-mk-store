import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { MarkDeliveredButton } from './MarkDeliveredButton';
import { OrderStatusSelect } from './OrderStatusSelect';
import { DeleteOrderButton } from './DeleteOrderButton';

async function getOrder(id: string, token: string | undefined) {
  if (!token) return null;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/admin/orders/${id}`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/login?from=/admin/orders');
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const order = await getOrder(id, token);
  if (!order) notFound();

  const userDisplay = order.user
    ? typeof order.user === 'object' && order.user.email
      ? order.user.email
      : String(order.user)
    : '—';

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-block text-sm text-primary-600 hover:underline dark:text-primary-400"
      >
        ← Back to orders
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order {order.orderId ?? `#${order._id.slice(-8)}`}
          </h1>
          {order.trackingNumber && (
            <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">
              Tracking: {order.trackingNumber}
            </p>
          )}
          {order.estimatedDelivery && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              order.isPaid
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
          >
            {order.isPaid ? 'Paid' : 'Pending'}
          </span>
          {(order.orderStatus || order.isDelivered) && (
            <OrderStatusSelect
              orderId={order._id}
              currentStatus={order.orderStatus ?? (order.isDelivered ? 'Delivered' : 'Processing')}
            />
          )}
          <MarkDeliveredButton
            orderId={order._id}
            isPaid={order.isPaid}
            isDelivered={order.isDelivered}
          />
          <DeleteOrderButton orderId={order._id} orderDisplayId={order.orderId ?? order._id} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Customer
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{userDisplay}</p>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Summary
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Items</dt>
              <dd className="font-medium">${order.itemsPrice?.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Shipping</dt>
              <dd className="font-medium">${order.shippingPrice?.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Tax</dt>
              <dd className="font-medium">${order.taxPrice?.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
              <dt className="font-semibold text-gray-900 dark:text-white">Total</dt>
              <dd className="font-semibold">${order.totalPrice?.toFixed(2)}</dd>
            </div>
          </dl>
          {order.paidAt && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Paid at {new Date(order.paidAt).toLocaleString()}
            </p>
          )}
          {order.deliveredAt && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Delivered at {new Date(order.deliveredAt).toLocaleString()}
            </p>
          )}
        </Card>
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Items
        </h2>
        <ul className="space-y-3">
          {order.items.map((item: { name: string; quantity: number; price: number }, idx: number) => (
            <li
              key={idx}
              className="flex justify-between text-gray-700 dark:text-gray-300"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </Card>

      {order.shippingAddress && (
        <Card className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Shipping address
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}{' '}
            {order.shippingAddress.country}
            {order.shippingAddress.phone && (
              <>
                <br />
                {order.shippingAddress.phone}
              </>
            )}
          </p>
        </Card>
      )}
    </div>
  );
}
