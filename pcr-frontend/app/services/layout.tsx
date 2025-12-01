import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Full-stack eCommerce development services: Shopify, Magento, custom platforms, API integrations, cloud hosting, and performance optimization.',
  openGraph: {
    title: 'Web Development Services | Zenweb',
    description: 'Full-stack eCommerce development services: Shopify, Magento, custom platforms, API integrations, cloud hosting, and performance optimization.',
    url: 'https://zenweb.studio/services',
  },
  twitter: {
    title: 'Web Development Services | Zenweb',
    description: 'Full-stack eCommerce development services: Shopify, Magento, custom platforms, API integrations, cloud hosting, and performance optimization.',
  },
  alternates: {
    canonical: 'https://zenweb.studio/services',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
