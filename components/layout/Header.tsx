'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartItemCount } from '@/store/hooks';
import { useWishlistIds } from '@/hooks/useWishlist';

function MKStoreLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 4L4 12v16h8V16h16v12h8V12L20 4z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Header() {
  const { user, loading, logout } = useAuth();
  const itemCount = useCartItemCount();
  const { ids: wishlistIds } = useWishlistIds();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (q) router.push(`/?q=${encodeURIComponent(q)}`);
    else router.push('/products');
    setMobileOpen(false);
  }

  const navLink = (href: string, label: string, isHash = false) => {
    const isActive = isHash ? false : pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`relative rounded-xl px-3 py-2.5 text-sm font-medium text-white transition duration-200 ${
          isActive ? 'text-primaryAccent' : 'hover:bg-white/10 hover:text-white'
        }`}
        onClick={() => setMobileOpen(false)}
      >
        {label}
        {isActive && (
          <span className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-primaryAccent" />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-[#49474D] shadow-nav">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        {/* Left: Logo + Name → Home */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-white transition hover:opacity-90"
          onClick={() => setMobileOpen(false)}
        >
          <MKStoreLogo className="h-8 w-8 text-primaryAccent" />
          <span className="text-xl font-bold tracking-tight">MK Store</span>
        </Link>

        {/* Center: Nav links — Home/Reviews/Contact scroll on home; Products & About are full pages */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLink('/#home', 'Home', true)}
          {navLink('/products', 'Products')}
          {navLink('/about', 'About')}
          {navLink('/#reviews', 'Reviews', true)}
          {navLink('/#contact', 'Contact', true)}
          {user?.role === 'admin' && navLink('/admin', 'Admin')}
        </nav>

        {/* Right: Search (desktop), Cart, Wishlist, Account */}
        <div className="flex items-center gap-1">
          <form onSubmit={handleSearch} className="hidden lg:block">
            <div className="relative flex w-[280px] rounded-lg bg-white/10">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border-0 bg-transparent py-2 pl-3 pr-10 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primaryAccent"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-lg p-2.5 text-white transition hover:bg-white/10"
            aria-label={mounted && itemCount > 0 ? `Cart (${itemCount})` : 'Cart'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={`absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primaryAccent text-xs font-semibold text-white ${!mounted || itemCount === 0 ? 'invisible' : ''}`}>
              {mounted && itemCount > 0 ? (itemCount > 99 ? '99+' : itemCount) : ''}
            </span>
          </Link>

          <Link
            href="/wishlist"
            className="relative inline-flex items-center justify-center rounded-lg p-2.5 text-white transition hover:bg-white/10"
            aria-label="Wishlist"
          >
            <svg className="h-5 w-5" fill={mounted && wishlistIds.size > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primaryAccent text-[10px] font-semibold text-white ${!mounted || wishlistIds.size === 0 ? 'invisible' : ''}`}>
              {mounted && wishlistIds.size > 0 ? (wishlistIds.size > 9 ? '9+' : wishlistIds.size) : ''}
            </span>
          </Link>

          {/* User Account Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              aria-expanded={accountOpen}
              aria-haspopup="true"
            >
              <span className="hidden sm:inline">{user ? user.name : 'Account'}</span>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              className={`absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 transition-all duration-200 ${
                accountOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
              }`}
              role="menu"
            >
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500">Loading…</div>
              ) : user ? (
                <>
                  <Link
                    href="/account"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setAccountOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setAccountOpen(false)}
                  >
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setAccountOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setAccountOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setAccountOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setAccountOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2.5 text-white hover:bg-white/10 md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#49474D] md:hidden">
          <div className="container mx-auto space-y-3 px-4 py-4">
            <form onSubmit={handleSearch}>
              <div className="relative flex rounded-lg bg-white/10">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-lg border-0 bg-transparent py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-2 text-white/80"
                  aria-label="Search"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
            <div className="flex flex-col gap-1">
              {navLink('/#home', 'Home', true)}
              {navLink('/products', 'Products')}
              {navLink('/about', 'About')}
              {navLink('/#reviews', 'Reviews', true)}
              {navLink('/#contact', 'Contact', true)}
              {user?.role === 'admin' && navLink('/admin', 'Admin')}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
