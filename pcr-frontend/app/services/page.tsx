'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/theme-context';

const services = [
  {
    title: 'eCommerce Platform Development',
    description: 'Custom online stores built on Shopify, Magento, WooCommerce, or headless architectures. Optimized for conversion and scalability.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    features: [
      'Shopify & Shopify Plus stores',
      'Magento & Adobe Commerce',
      'WooCommerce customization',
      'Headless commerce (Next.js + Shopify)',
      'Multi-currency & multi-language',
    ],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Mobile-First Web Design',
    description: 'Responsive, accessible interfaces designed for all devices. User research-driven UX that converts visitors into customers.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    features: [
      'Responsive design systems',
      'UI/UX prototyping',
      'Accessibility (WCAG) compliance',
      'Design system development',
      'User testing & iteration',
    ],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Progressive Web Apps (PWA)',
    description: 'App-like experiences on the web. Offline support, push notifications, and native-feel performance without app store distribution.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    features: [
      'Offline-first architecture',
      'Service worker implementation',
      'Push notification setup',
      'App manifest configuration',
      'Performance optimization',
    ],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'API Development & Integration',
    description: 'RESTful and GraphQL APIs that connect your systems. Third-party integrations with payment gateways, CRMs, ERPs, and more.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    features: [
      'REST API design & development',
      'GraphQL schema implementation',
      'Payment gateway integration',
      'CRM & ERP connections',
      'Webhook & automation setup',
    ],
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Database Architecture',
    description: 'Scalable data models and optimized queries. PostgreSQL, MongoDB, and cloud database solutions designed for growth.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    features: [
      'PostgreSQL & MySQL',
      'MongoDB & NoSQL solutions',
      'Database migration & optimization',
      'Data modeling & schema design',
      'Query performance tuning',
    ],
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Cloud Hosting & DevOps',
    description: 'Managed hosting, CI/CD pipelines, and infrastructure automation. AWS, Vercel, and Railway deployments with 99.9% uptime.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    features: [
      'AWS & Google Cloud setup',
      'Vercel & Railway deployment',
      'CI/CD pipeline automation',
      'Container orchestration',
      'Auto-scaling configuration',
    ],
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Performance Optimization',
    description: 'Core Web Vitals optimization, caching strategies, and load time improvements. Make your site fast and keep it that way.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    features: [
      'Core Web Vitals audit',
      'Image & asset optimization',
      'CDN configuration',
      'Caching strategies',
      'Bundle size reduction',
    ],
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Security & Compliance',
    description: 'OWASP best practices, SSL configuration, and security audits. PCI compliance for eCommerce and GDPR-ready implementations.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    features: [
      'Security audits & penetration testing',
      'SSL/TLS configuration',
      'PCI DSS compliance',
      'GDPR implementation',
      'Authentication & authorization',
    ],
    gradient: 'from-red-500 to-pink-500',
  },
  {
    title: 'CMS Customization',
    description: 'Headless CMS setup and customization. Contentful, Sanity, Strapi, or WordPress tailored to your content workflow.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    features: [
      'Contentful & Sanity setup',
      'Strapi customization',
      'WordPress headless',
      'Content modeling',
      'Editorial workflow design',
    ],
    gradient: 'from-teal-500 to-green-500',
  },
];

export default function ServicesPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-gray-300/30'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-purple-600/10' : 'bg-gray-400/20'}`} style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-200 border border-gray-300 text-gray-600'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'}`} />
              Full-Stack Solutions
            </div>
            <h1 className={`text-5xl lg:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Our <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Enterprise-grade web development and eCommerce solutions.
              From custom platforms to system integrations—we build digital experiences that scale.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative pb-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`group relative backdrop-blur-sm rounded-2xl border p-8 transition-all ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                  theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'
                }`}>
                  {service.icon}
                </div>

                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.title}
                </h3>
              </div>

                <p className={`mb-6 text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {service.description}
                </p>

                <div className={`border-t pt-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Quote Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Decorative elements */}
            <div className={`absolute -top-8 -left-8 w-24 h-24 rounded-full blur-2xl ${theme === 'dark' ? 'bg-gray-500/20' : 'bg-gray-300/40'}`} />
            <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-2xl ${theme === 'dark' ? 'bg-gray-600/20' : 'bg-gray-400/30'}`} />

            {/* Quote marks */}
            <div className="relative">
              <svg className={`absolute -top-6 -left-4 w-16 h-16 ${theme === 'dark' ? 'text-gray-500/20' : 'text-gray-400/30'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              <div className={`relative backdrop-blur-sm border rounded-2xl p-10 md:p-14 ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <p className={`text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed italic ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  High performance should be built{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium not-italic">
                    lightweight
                  </span>
                  —with as few moving parts as possible.
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${theme === 'dark' ? 'via-white/20' : 'via-gray-300'}`} />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    <span className={`text-sm font-medium tracking-wider uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Our Philosophy</span>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  </div>
                  <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${theme === 'dark' ? 'via-white/20' : 'via-gray-300'}`} />
                </div>
              </div>

              <svg className={`absolute -bottom-6 -right-4 w-16 h-16 rotate-180 ${theme === 'dark' ? 'text-gray-500/20' : 'text-gray-400/30'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative overflow-hidden rounded-3xl p-12 text-center ${
              theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-900'
            }`}
          >
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Start Your Project?</h2>
              <p className={`mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`}>
                Tell us about your requirements and we'll put together a detailed proposal within 48 hours.
              </p>
              <Link
                href="/#submit-ticket"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Start a Project
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
