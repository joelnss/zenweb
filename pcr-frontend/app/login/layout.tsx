import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Zenweb account to access your client portal and manage your projects.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://zenweb.studio/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
