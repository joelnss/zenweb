import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloud Hosting',
  description: 'Enterprise-grade cloud hosting with 99.99% uptime. AWS infrastructure, auto-scaling, global CDN, and 24/7 monitoring included.',
  openGraph: {
    title: 'Cloud Hosting Solutions | Zenweb',
    description: 'Enterprise-grade cloud hosting with 99.99% uptime. AWS infrastructure, auto-scaling, global CDN, and 24/7 monitoring included.',
    url: 'https://zenweb.studio/hosting',
  },
  twitter: {
    title: 'Cloud Hosting Solutions | Zenweb',
    description: 'Enterprise-grade cloud hosting with 99.99% uptime. AWS infrastructure, auto-scaling, global CDN, and 24/7 monitoring.',
  },
  alternates: {
    canonical: 'https://zenweb.studio/hosting',
  },
};

export default function HostingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
