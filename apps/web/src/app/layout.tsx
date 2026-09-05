import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'EVERHERE — You\'re not alone when help is needed.',
    template: '%s | EVERHERE',
  },
  description:
    'EVERHERE is a free, community-built personal-safety communication platform. Signal your safety status and reach trusted humans quickly.',
  keywords: ['safety', 'community', 'open source', 'personal safety', 'communication'],
  authors: [{ name: 'EVERHERE Community' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'EVERHERE',
    title: 'EVERHERE — You\'re not alone when help is needed.',
    description:
      'A free, community-built personal-safety communication platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EVERHERE — You\'re not alone when help is needed.',
    description:
      'A free, community-built personal-safety communication platform.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-neutral-50 text-neutral-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
