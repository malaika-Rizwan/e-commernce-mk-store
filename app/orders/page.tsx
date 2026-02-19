import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { Card } from '@/components/ui/Card';

async function getOrders(token: string | undefined) {
  if (!token) return { orders: [] };
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/orders`, {
    headers: { Cookie: `auth-token=${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return { orders: [] };
  const json = await res.json();
  return json.data;
}

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect('/login?from=/orders');
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const { orders } = await getOrders(token);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Orders
      </h1>

      {orders.length === 0 ? (
        <Card>
          <p className="text-gray-600 dark:text-gray-400">You have no orders yet.</p>
          <Link href="/products" className="mt-4 inline-block text-primary-600 hover:underline">
            Browse products
          </Link>
        </Card>
      ) : (
        <ul className="space-y-4">
          {orders.map((order: { _id: string; totalPrice: number; isPaid: boolean; isDelivered?: boolean; createdAt: string }) => (
            <li key={order._id}>
              <Link href={`/orders/${order._id}`}>
                <Card className="transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order #{order._id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} · $
                        {order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          order.isPaid
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                      {order.isDelivered && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Delivered
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
