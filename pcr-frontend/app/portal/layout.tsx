import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Portal',
  description: 'Access your Zenweb client portal. Track projects, view tickets, and manage your account.',
  openGraph: {
    title: 'Client Portal | Zenweb',
    description: 'Access your Zenweb client portal. Track projects, view tickets, and manage your account.',
    url: 'https://zenweb.studio/portal',
  },
  alternates: {
    canonical: 'https://zenweb.studio/portal',
  },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
