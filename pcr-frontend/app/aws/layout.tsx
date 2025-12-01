import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AWS Cloud Services',
  description: 'AWS cloud hosting and infrastructure services. EC2, S3, CloudFront CDN, managed databases, and DevOps automation for your eCommerce platform.',
  openGraph: {
    title: 'AWS Cloud Services | Zenweb',
    description: 'AWS cloud hosting and infrastructure services. EC2, S3, CloudFront CDN, managed databases, and DevOps automation.',
    url: 'https://zenweb.studio/aws',
  },
  twitter: {
    title: 'AWS Cloud Services | Zenweb',
    description: 'AWS cloud hosting and infrastructure services. EC2, S3, CloudFront CDN, managed databases, and DevOps automation.',
  },
  alternates: {
    canonical: 'https://zenweb.studio/aws',
  },
};

export default function AWSLayout({ children }: { children: React.ReactNode }) {
  return children;
}
