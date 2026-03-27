import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Lumora',
    template: '%s | Lumora',
  },
  description:
    'Discover, browse, and purchase books online. Thousands of titles across every genre, delivered to your door.',
  keywords: [
    'bookstore',
    'books',
    'buy books',
    'online bookstore',
    'ebooks',
    'fiction',
    'non-fiction',
  ],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Lumora',
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
      <body className={`${jetbrainsMono.variable} ${jetbrainsMono.className}`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-[#F8FAFB]">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
