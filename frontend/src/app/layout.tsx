import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Sidebar } from '@/components/layout/sidebar';
import { LayoutContent } from '@/components/layout/layout-content';
import { Header } from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'PageTurner — Online Bookstore',
    template: '%s | PageTurner',
  },
  description:
    'Discover, browse, and purchase books online. Thousands of titles across every genre, delivered to your door.',
  keywords: ['bookstore', 'books', 'buy books', 'online bookstore', 'ebooks', 'fiction', 'non-fiction'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'PageTurner — Online Bookstore',
    description: 'Discover, browse, and purchase books online.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen bg-[#F8FAFB]">
            {/* The Sidebar will only show on non-admin routes because admin has its own layout */}
            <Sidebar />

            {/* Main Content Area */}
            <LayoutContent>
              <Header />
              {children}
            </LayoutContent>
          </div>
        </Providers>
      </body>
    </html>
  );
}
