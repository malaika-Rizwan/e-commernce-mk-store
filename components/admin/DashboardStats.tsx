'use client';

import Link from 'next/link';

interface DashboardStatsProps {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const cards = [
  {
    label: 'Total users',
    value: (d: DashboardStatsProps) => d.totalUsers.toLocaleString(),
    href: '/admin/users',
    color: 'bg-blue-500',
    icon: UsersIcon,
  },
  {
    label: 'Total products',
    value: (d: DashboardStatsProps) => d.totalProducts.toLocaleString(),
    href: '/admin/products',
    color: 'bg-emerald-500',
    icon: PackageIcon,
  },
  {
    label: 'Total orders',
    value: (d: DashboardStatsProps) => d.totalOrders.toLocaleString(),
    href: '/admin/orders',
    color: 'bg-amber-500',
    icon: OrderIcon,
  },
  {
    label: 'Total revenue',
    value: (d: DashboardStatsProps) => `$${d.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    href: '/admin/orders',
    color: 'bg-violet-500',
    icon: RevenueIcon,
  },
];

export function DashboardStats(props: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {card.value(props)}
              </p>
            </div>
            <div
              className={`rounded-lg ${card.color} p-3 text-white opacity-90 group-hover:opacity-100`}
            >
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function OrderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function RevenueIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
