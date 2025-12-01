import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your Zenweb account to access the client portal and start your project.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://zenweb.studio/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
