import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Sidebar } from '@/components/layout/sidebar';
import { LayoutContent } from '@/components/layout/layout-content';
import { Header } from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Online Bookstore',
  description: 'Browse and purchase books online',
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
