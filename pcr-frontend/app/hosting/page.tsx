'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/lib/theme/theme-context';

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<200ms', label: 'Global Response Time' },
  { value: '24/7', label: 'Expert Support' },
];

const features = [
  {
    title: 'Enterprise Security',
    description: 'SOC 2 compliant infrastructure with automated threat detection, DDoS protection, and daily backups.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Auto-Scaling Infrastructure',
    description: 'Handle traffic spikes without breaking a sweat. Resources scale automatically to meet demand.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'Global CDN',
    description: '300+ edge locations worldwide. Your content delivered fast, no matter where your customers are.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Managed Updates',
    description: 'We handle all platform updates, security patches, and maintenance. You focus on your business.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Staging Environments',
    description: 'Test changes safely with one-click staging. Push to production when you\'re ready.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Expert Support',
    description: 'Real engineers, not scripts. Get help from people who understand eCommerce at scale.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const platforms = [
  'Magento',
  'Shopware',
  'BigCommerce',
  'Shopify',
  'WordPress',
  'Custom Apps',
];

const faqs = [
  {
    question: 'What platforms do you host?',
    answer: 'We specialize in eCommerce platforms including Magento, Shopware, BigCommerce storefronts, and custom web applications built with Next.js, Node.js, and other modern frameworks.',
  },
  {
    question: 'How do you handle traffic spikes?',
    answer: 'Our infrastructure auto-scales based on demand. Whether it\'s Black Friday or a viral moment, your site stays fast and available without manual intervention.',
  },
  {
    question: 'What\'s included in managed hosting?',
    answer: 'Everything: server management, security monitoring, automated backups, SSL certificates, CDN, staging environments, and 24/7 support from real engineers.',
  },
  {
    question: 'Can you migrate our existing site?',
    answer: 'Yes. We handle full migrations with zero downtime. Our team manages DNS, data transfer, and testing to ensure a smooth transition.',
  },
  {
    question: 'What\'s your uptime guarantee?',
    answer: 'We guarantee 99.99% uptime backed by SLA. Our infrastructure is designed with redundancy at every layer.',
  },
  {
    question: 'How is pricing structured?',
    answer: 'Every project is quoted individually based on your specific needs. We offer free evaluations at no cost—reach out and we\'ll assess your requirements and provide a custom quote tailored to your business.',
  },
];

export default function HostingPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section className={`relative py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
                theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'}`} />
                Enterprise Hosting
              </div>
              <h1 className={`text-4xl lg:text-5xl font-bold mb-6 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Hosting that scales with your business
              </h1>
              <p className={`text-xl mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Enterprise-grade infrastructure without the enterprise complexity.
                We handle the servers so you can focus on selling.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/start-project?service=hosting"
                  className={`px-8 py-4 font-semibold rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Get a Quote
                </Link>
                <Link
                  href="/services"
                  className={`px-8 py-4 font-semibold rounded-lg transition-colors border ${
                    theme === 'dark'
                      ? 'border-white/20 text-white hover:bg-white/5'
                      : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  View All Services
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 border-y ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-100'}`}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </div>
                <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Platforms We Support
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Optimized hosting for the platforms you rely on
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {platforms.map((platform) => (
              <div
                key={platform}
                className={`px-6 py-3 rounded-lg font-medium border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-gray-300'
                    : 'bg-gray-100 border-gray-200 text-gray-700'
                }`}
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Everything you need, nothing you don't
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Enterprise features at a fraction of the cost. No hidden fees, no surprise charges.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-950 border-white/10'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                The real cost of self-hosting
              </h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                When you factor in DevOps salaries, security tools, and downtime costs,
                managed hosting often saves 40-60% compared to DIY.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Self-Hosted */}
              <div className={`p-8 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Self-Hosted
                </h3>
                <ul className="space-y-4">
                  {[
                    'Server infrastructure costs',
                    'DevOps engineer salary',
                    'Security monitoring tools',
                    'Backup solutions',
                    'CDN subscriptions',
                    'SSL certificate management',
                    'On-call coverage',
                    'Training & certification',
                  ].map((item) => (
                    <li key={item} className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="text-red-500">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Managed by Zenweb */}
              <div className={`p-8 rounded-xl border-2 ${
                theme === 'dark' ? 'bg-white/5 border-white' : 'bg-white border-gray-900'
              }`}>
                <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Managed by Zenweb
                </h3>
                <ul className="space-y-4">
                  {[
                    'All infrastructure included',
                    'Expert support included',
                    'Enterprise security included',
                    'Daily backups included',
                    'Global CDN included',
                    'SSL certificates included',
                    '24/7 monitoring included',
                    'No hidden fees',
                  ].map((item) => (
                    <li key={item} className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-gray-950 border-white/10'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className={`max-w-4xl mx-auto text-center p-12 rounded-2xl border ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'
          }`}>
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Ready to stop managing servers?
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Let us handle the infrastructure while you focus on growing your business.
              Get a custom quote in 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/start-project?service=hosting"
                className={`px-8 py-4 font-semibold rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Get a Quote
              </Link>
              <a
                href="mailto:hello@zenith.dev"
                className={`px-8 py-4 font-semibold rounded-lg transition-colors border ${
                  theme === 'dark'
                    ? 'border-white/20 text-white hover:bg-white/5'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                }`}
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
