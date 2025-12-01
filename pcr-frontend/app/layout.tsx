import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/lib/theme/theme-context";
import LayoutClient from "@/components/layout/LayoutClient";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = 'https://zenweb.studio';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zenweb - High Performance eCommerce Solutions",
    template: "%s | Zenweb"
  },
  description: "Michigan-based eCommerce agency specializing in Shopify, Magento, and custom web development. Fast, lean, scalable solutions with 15+ years of experience.",
  keywords: ["eCommerce development", "Shopify", "Magento", "web development", "Michigan", "custom websites", "performance optimization", "AWS hosting"],
  authors: [{ name: "Zenweb" }],
  creator: "Zenweb",
  publisher: "Zenweb",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Zenweb',
    title: 'Zenweb - High Performance eCommerce Solutions',
    description: 'Michigan-based eCommerce agency specializing in Shopify, Magento, and custom web development. Fast, lean, scalable solutions with 15+ years of experience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zenweb - High Performance eCommerce Solutions',
    description: 'Michigan-based eCommerce agency specializing in Shopify, Magento, and custom web development. Fast, lean, scalable solutions.',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <LayoutClient>{children}</LayoutClient>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
