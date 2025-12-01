import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start a Project',
  description: 'Ready to build something great? Tell us about your project and get a detailed proposal within 48 hours.',
  openGraph: {
    title: 'Start Your Project | Zenweb',
    description: 'Ready to build something great? Tell us about your project and get a detailed proposal within 48 hours.',
    url: 'https://zenweb.studio/start-project',
  },
  twitter: {
    title: 'Start Your Project | Zenweb',
    description: 'Ready to build something great? Tell us about your project and get a detailed proposal within 48 hours.',
  },
  alternates: {
    canonical: 'https://zenweb.studio/start-project',
  },
};

export default function StartProjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
