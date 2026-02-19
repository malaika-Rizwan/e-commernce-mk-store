'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { ContactAnalyticsCard } from '@/components/admin/ContactAnalyticsCard';
import { MonthlySalesChart } from '@/components/admin/MonthlySalesChart';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlySales: Array<{ month: string; revenue: number; orders: number }>;
  contactStats?: {
    totalMessages: number;
    newMessages: number;
    repliedMessages: number;
    messagesThisMonth: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load stats');
        return res.json();
      })
      .then((data) => setStats(data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard…</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-300">{error ?? 'Failed to load stats'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your store: users, products, orders, and revenue.
        </p>
      </div>

      <DashboardStats
        totalUsers={stats.totalUsers}
        totalProducts={stats.totalProducts}
        totalOrders={stats.totalOrders}
        totalRevenue={stats.totalRevenue}
      />

      {stats.contactStats && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Contact analytics
          </h2>
          <ContactAnalyticsCard stats={stats.contactStats} />
        </div>
      )}

      <MonthlySalesChart data={stats.monthlySales} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/users"
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage users
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View and manage user accounts and roles.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-primary-600 dark:text-primary-400">
              Users →
            </span>
          </Link>
          <Link
            href="/admin/products"
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage products
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Add, edit, and delete products. Upload images and set categories.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-primary-600 dark:text-primary-400">
              Products →
            </span>
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage orders
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View orders, update status, mark as delivered, and see revenue.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-primary-600 dark:text-primary-400">
              Orders →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
