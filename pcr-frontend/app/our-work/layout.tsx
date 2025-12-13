import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Work | Zenweb',
  description: 'Featured projects and case studies from Zenweb.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function OurWorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
