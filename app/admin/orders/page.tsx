'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AdminBackButton } from '@/components/admin/AdminBackButton';

interface Order {
  _id: string;
  user?: { email: string; name: string } | string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  deliveredOrders: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchOrders() {
    const res = await fetch('/api/admin/orders', { credentials: 'include' });
    const data = await res.json();
    if (data.success && data.data?.orders) {
      setOrders(data.data.orders);
    }
  }

  async function fetchStats() {
    const res = await fetch(`/api/admin/orders/stats?period=${period}`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success && data.data) {
      setStats(data.data);
    }
  }

  useEffect(() => {
    Promise.all([fetchOrders(), fetchStats()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) fetchStats();
  }, [period]);

  async function handleMarkDelivered(orderId: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isDelivered: true }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? { ...o, isDelivered: true, deliveredAt: new Date().toISOString() }
              : o
          )
        );
        if (stats) {
          setStats((s) =>
            s ? { ...s, deliveredOrders: s.deliveredOrders + 1 } : null
          );
        }
      } else {
        alert(data.error ?? 'Failed to update');
      }
    } catch {
      alert('Network error');
    } finally {
      setUpdatingId(null);
    }
  }

  const userDisplay = (order: Order) => {
    const u = order.user;
    if (!u) return '—';
    if (typeof u === 'string') return u;
    return u.email ?? u.name ?? '—';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <AdminBackButton />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Orders
        </h1>
      </div>

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card padding="md">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total revenue
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.totalRevenue.toFixed(2)}
            </p>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-2 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All time</option>
              <option value="month">Last 30 days</option>
              <option value="week">Last 7 days</option>
            </select>
          </Card>
          <Card padding="md">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total orders
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalOrders}
            </p>
          </Card>
          <Card padding="md">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Paid orders
            </p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.paidOrders}
            </p>
          </Card>
          <Card padding="md">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Delivered
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
              {stats.deliveredOrders}
            </p>
          </Card>
        </div>
      )}

      {orders.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No orders yet.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Order / Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                      >
                        #{order._id.slice(-8)}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {userDisplay(order)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            order.isPaid
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                        {order.isDelivered ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Delivered
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {order.isPaid && !order.isDelivered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkDelivered(order._id)}
                          disabled={updatingId === order._id}
                          isLoading={updatingId === order._id}
                        >
                          Mark delivered
                        </Button>
                      )}
                      {order.isDelivered && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {order.deliveredAt
                            ? new Date(order.deliveredAt).toLocaleDateString()
                            : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
