import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Zenweb. Let\'s discuss your eCommerce project and build something great together.',
  openGraph: {
    title: 'Contact Zenweb',
    description: 'Get in touch with Zenweb. Let\'s discuss your eCommerce project and build something great together.',
    url: 'https://zenweb.studio/contact',
  },
  twitter: {
    title: 'Contact Zenweb',
    description: 'Get in touch with Zenweb. Let\'s discuss your eCommerce project and build something great together.',
  },
  alternates: {
    canonical: 'https://zenweb.studio/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
