import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      <div className="flex w-full">
        <AdminSidebar />
        <div
          className="min-w-0 flex-1 px-4 py-6 pb-12 sm:px-6 sm:pb-16"
          style={{ backgroundColor: '#BEB9B4' }}
        >
          <div className="mx-auto max-w-6xl rounded-xl bg-[#E6E2DE] p-6 shadow-md sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
