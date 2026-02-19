import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com';

export const metadata: Metadata = {
  title: {
    default: 'MK Store',
    template: '%s | MK Store',
  },
  description: 'MK Store – Your trusted e-commerce destination. Shop securely with quality products, fast delivery, and dedicated support.',
  keywords: ['e-commerce', 'MK Store', 'online store', 'shopping'],
  authors: [{ name: 'MK Store' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'MK Store',
    title: 'MK Store',
    description: 'Your trusted e-commerce destination. Shop securely with quality products.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MK Store',
    description: 'Your trusted e-commerce destination. Shop securely.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(BASE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
