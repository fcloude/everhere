'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" className="py-12 lg:py-20">
        <div className="container-narrow">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-4">
                <img src="/logo.png" alt="EVERHERE logo" className="h-12 w-auto mx-auto" />
              </Link>
            </div>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
