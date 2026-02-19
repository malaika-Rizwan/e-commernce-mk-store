import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pageBg flex flex-col items-center justify-center px-4">
      <p className="text-8xl font-bold text-primaryAccent">404</p>
      <h1 className="mt-6 text-2xl font-bold text-darkBase">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-center text-darkBase/70">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-xl bg-primaryAccent px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/products"
          className="rounded-xl border border-darkBase/20 bg-cardBg px-6 py-3 text-sm font-medium text-darkBase transition hover:bg-darkBase/10"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}
