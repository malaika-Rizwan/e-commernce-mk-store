'use client';

import Link from 'next/link';

interface ContactAnalyticsCardProps {
  stats: {
    totalMessages: number;
    newMessages: number;
    repliedMessages: number;
    messagesThisMonth: number;
  };
}

export function ContactAnalyticsCard({ stats }: ContactAnalyticsCardProps) {
  const cards = [
    {
      label: 'Total messages',
      value: stats.totalMessages.toLocaleString(),
      href: '/admin/messages',
      color: 'bg-sky-500',
      icon: MailIcon,
    },
    {
      label: 'New messages',
      value: stats.newMessages.toLocaleString(),
      href: '/admin/messages',
      color: 'bg-amber-500',
      icon: InboxIcon,
    },
    {
      label: 'Replied',
      value: stats.repliedMessages.toLocaleString(),
      href: '/admin/messages',
      color: 'bg-emerald-500',
      icon: CheckIcon,
    },
    {
      label: 'This month',
      value: stats.messagesThisMonth.toLocaleString(),
      href: '/admin/messages',
      color: 'bg-indigo-500',
      icon: CalendarIcon,
    },
  ];

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
                {card.value}
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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
