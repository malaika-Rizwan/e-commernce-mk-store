'use client';

import { useRouter } from 'next/navigation';

export function AdminBackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-lg border-2 border-[#EBBB69] bg-white/80 px-3 py-2 text-sm font-medium text-[#49474D] transition hover:bg-[#EBBB69] hover:text-white"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </button>
  );
}
