import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { AccountProfileSection } from '@/components/account/AccountProfileSection';

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/login?from=/account');

  await connectDB();
  const user = await User.findById(session.userId).select('-password').lean();
  if (!user) redirect('/login');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-[#49474D]">
        Profile dashboard
      </h1>
      <div className="space-y-8">
        <AccountProfileSection />
      </div>
    </div>
  );
}
