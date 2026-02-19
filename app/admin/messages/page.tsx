'use client';

import { useEffect, useState } from 'react';
import { AdminBackButton } from '@/components/admin/AdminBackButton';

interface MessageRow {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MessageRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  function loadMessages() {
    setLoading(true);
    setError(null);
    fetch('/api/admin/messages', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load messages');
        return res.json();
      })
      .then((data) => setMessages(data.data?.messages ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    fetch(`/api/admin/messages/${detailId}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load message');
        return res.json();
      })
      .then((data) => {
        setDetail(data.data?.message ?? null);
      })
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [detailId]);

  function handleMarkRead(id: string) {
    fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'read' }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update');
        return res.json();
      })
      .then(() => {
        setMessages((prev) =>
          prev.map((m) => (m._id === id ? { ...m, status: 'read' } : m))
        );
        if (detail?._id === id) setDetail((d) => (d ? { ...d, status: 'read' } : null));
      })
      .catch(() => {});
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    fetch(`/api/admin/messages/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete');
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (detailId === id) {
          setDetailId(null);
          setDetail(null);
        }
      })
      .catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading messages…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <AdminBackButton />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Contact Messages
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View, mark as read, and manage contact form submissions.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No messages yet.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg._id} className="bg-white dark:bg-gray-800">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {msg.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <a href={`mailto:${msg.email}`} className="hover:underline">
                        {msg.email}
                      </a>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {msg.subject || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          msg.status === 'new'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : msg.status === 'replied'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => setDetailId(msg._id)}
                        className="mr-2 font-medium text-primary-600 hover:underline dark:text-primary-400"
                      >
                        View
                      </button>
                      {msg.status === 'new' && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(msg._id)}
                          className="mr-2 font-medium text-gray-600 hover:underline dark:text-gray-400"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(msg._id)}
                        className="font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message detail modal */}
      {detailId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-detail-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 id="message-detail-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Message
              </h2>
              <button
                type="button"
                onClick={() => { setDetailId(null); setDetail(null); }}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading…</p>
              ) : detail ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-white">{detail.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${detail.email}`} className="text-primary-600 hover:underline dark:text-primary-400">
                      {detail.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Subject</p>
                    <p className="text-gray-900 dark:text-white">{detail.subject || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-gray-900 dark:text-white">
                      {detail.createdAt
                        ? new Date(detail.createdAt).toLocaleString('en-US', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Message</p>
                    <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                      {detail.message}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4">
                    {detail.status === 'new' && (
                      <button
                        type="button"
                        onClick={() => { handleMarkRead(detail._id); }}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(detail._id)}
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Could not load message.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
