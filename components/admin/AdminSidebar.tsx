'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 70;

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: DashboardIcon },
  { href: '/admin/users', label: 'Users', icon: UsersIcon },
  { href: '/admin/products', label: 'Products', icon: ProductsIcon },
  { href: '/admin/orders', label: 'Orders', icon: OrdersIcon },
  { href: '/admin/messages', label: 'Messages', icon: MessagesIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <nav className="flex flex-col gap-0.5 px-2 py-2">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
              isActive
                ? 'border-l-4 border-[#EBBB69] bg-[#EBBB69]/20 text-[#49474D]'
                : 'border-l-4 border-transparent text-white/90 hover:bg-white/10 hover:text-white'
            } ${collapsed ? 'justify-center px-2' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
      <Link
        href="/"
        title={collapsed ? 'Back to store' : undefined}
        className={`mt-4 flex items-center gap-3 rounded-lg border-l-4 border-transparent px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-2' : ''}`}
        onClick={() => setMobileOpen(false)}
      >
        <BackIcon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>Back to store</span>}
      </Link>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={`mt-4 flex items-center gap-3 rounded-lg border-l-4 border-transparent px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center w-full px-2' : ''}`}
        title={collapsed ? (collapsed ? 'Expand' : 'Collapse') : undefined}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronIcon className="h-5 w-5 shrink-0" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-20 z-30 flex h-10 w-10 items-center justify-center rounded-lg shadow-lg md:hidden"
        style={{ backgroundColor: '#49474D' }}
        aria-label="Open menu"
      >
        <MenuIcon className="h-6 w-6 text-white" />
      </button>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed left-0 top-14 z-10 shrink-0 self-start overflow-y-auto rounded-br-xl shadow-lg transition-all duration-300 ease-in-out md:sticky md:left-0 md:top-14 md:mb-6 md:h-auto md:p-0 ${
          !mobileOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        }`}
        style={{
          width: mobileOpen || !collapsed ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
          maxHeight: 'calc(100vh - 3.5rem)',
          backgroundColor: '#49474D',
        }}
      >
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-tr-none pt-0 pb-3 pl-2 pr-2 text-white no-underline hover:bg-white/5"
          style={{ minHeight: '3rem' }}
        >
          <span className="flex shrink-0 items-center justify-center" style={{ width: 24, height: 24 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
              <path d="M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
              <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/>
            </svg>
          </span>
          <span className={`font-semibold text-white overflow-hidden whitespace-nowrap transition-[width,opacity] duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            MKStore
          </span>
        </Link>
        <div className="flex items-center justify-between px-2 py-2 md:hidden">
          <span className="text-sm font-medium text-white">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 text-white/80 hover:bg-white/10"
            aria-label="Close menu"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="py-2">{navContent}</div>
      </aside>
    </>
  );
}

function ChevronIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 7l-7-7 7-7" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ProductsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function MessagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}
