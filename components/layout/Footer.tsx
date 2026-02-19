import Link from 'next/link';

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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#49474D] text-white/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: MK Store */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-primaryAccent transition">
              <MKStoreLogo className="h-8 w-8 text-primaryAccent" />
              <span className="text-lg font-bold">MK Store</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Your trusted destination for quality products. We deliver with care and support you every step of the way.
            </p>
          </div>

          {/* Column 2: Get to Know Us */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Get to Know Us
            </h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm transition hover:text-primaryAccent">About</Link></li>
              <li><a href="#" className="text-sm transition hover:text-primaryAccent">Careers</a></li>
              <li><a href="#" className="text-sm transition hover:text-primaryAccent">Blog</a></li>
              <li><Link href="/contact" className="text-sm transition hover:text-primaryAccent">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Make Money With Us */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Make Money With Us
            </h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-sm transition hover:text-primaryAccent">Sell on MK</a></li>
              <li><a href="#" className="text-sm transition hover:text-primaryAccent">Become Affiliate</a></li>
              <li><a href="#" className="text-sm transition hover:text-primaryAccent">Advertise Products</a></li>
            </ul>
          </div>

          {/* Column 4: Help */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Help
            </h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/contact" className="text-sm transition hover:text-primaryAccent">Customer Service</Link></li>
              <li><a href="#" className="text-sm transition hover:text-primaryAccent">Returns</a></li>
              <li><a href="#" className="text-sm transition hover:text-primaryAccent">Shipping</a></li>
              <li><a href="#" className="text-sm transition hover:text-primaryAccent">FAQs</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm">
              © {currentYear} MK Store. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-white/70 transition hover:text-primaryAccent"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a
                href="#"
                className="text-white/70 transition hover:text-primaryAccent"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a
                href="#"
                className="text-white/70 transition hover:text-primaryAccent"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.265.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.058 1.645-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
