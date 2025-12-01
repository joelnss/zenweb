'use client';

import Header from './Header';
import Footer from './Footer';
import PageTracker from '@/components/analytics/PageTracker';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageTracker />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
