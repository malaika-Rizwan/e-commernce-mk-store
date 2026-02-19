import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { Card } from '@/components/ui/Card';

async function getOrder(orderId: string, token: string | undefined) {
  if (!token) return null;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/orders/${orderId}`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login?from=/orders');
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const order = await getOrder(id, token);
  if (!order) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/orders"
        className="mb-6 inline-block text-sm text-primary-600 hover:underline"
      >
        ← Back to orders
      </Link>
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Order #{order._id.slice(-8)}
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
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
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={
                order.isPaid
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }
            >
              {order.isPaid ? 'Paid' : 'Pending'}
            </span>
            {order.isDelivered && (
              <>
                <span className="text-gray-400">·</span>
                <span className="text-blue-600 dark:text-blue-400">
                  Delivered
                  {order.deliveredAt
                    ? ` on ${new Date(order.deliveredAt).toLocaleDateString()}`
                    : ''}
                </span>
              </>
            )}
          </div>
        </Card>
      </div>

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
          </p>
        </Card>
      )}
    </div>
  );
}
