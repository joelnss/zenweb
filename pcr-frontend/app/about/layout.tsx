import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Meet Zenweb - a Michigan-based eCommerce agency with 15+ years of experience building fast, lean, and scalable web solutions. No fluff, no BS, just results.',
  openGraph: {
    title: 'About Zenweb - Michigan eCommerce Experts',
    description: 'Meet Zenweb - a Michigan-based eCommerce agency with 15+ years of experience building fast, lean, and scalable web solutions.',
    url: 'https://zenweb.studio/about',
  },
  twitter: {
    title: 'About Zenweb - Michigan eCommerce Experts',
    description: 'Meet Zenweb - a Michigan-based eCommerce agency with 15+ years of experience building fast, lean, and scalable web solutions.',
  },
  alternates: {
    canonical: 'https://zenweb.studio/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
