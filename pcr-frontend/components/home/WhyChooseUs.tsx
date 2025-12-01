'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/theme-context';

const integrations = [
  { name: 'Magento', icon: '🔶' },
  { name: 'BigCommerce', icon: '🛍️' },
  { name: 'Shopware', icon: '🔷' },
  { name: 'Shopify', icon: '🛒' },
  { name: 'Custom Build', icon: '⚙️' },
  { name: 'Stripe', icon: '💳' },
  { name: 'Salesforce', icon: '☁️' },
  { name: 'HubSpot', icon: '🧡' },
];

const features = [
  {
    title: 'Integration First',
    description: 'We connect your stack. ERPs, CRMs, payment gateways—all working as one.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    title: 'Performance Obsessed',
    description: 'Sub-second loads. Optimized Core Web Vitals. Speed that converts.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Security Built-In',
    description: 'OWASP compliant. PCI ready. Your data stays protected.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  const { theme } = useTheme();

  return (
    <section className={`py-24 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Animated background orbs - Fast */}
      <motion.div
        className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, 50, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl"
        animate={{
          x: [0, -70, 0],
          y: [0, 70, 0],
          scale: [1, 0.85, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Floating hearts like community section */}
      <motion.div
        className="absolute top-20 right-1/4 text-blue-500"
        animate={{ scale: [1, 1.3, 1], y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-1/4 text-lime-400"
        animate={{ scale: [1, 1.4, 1], y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>

      {/* Floating dots */}
      <motion.div
        className="absolute top-40 left-20 w-4 h-4 bg-cyan-400 rounded-full"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-5 h-5 bg-blue-400 rounded-full"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
      />
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`text-4xl lg:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            We Connect
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Everything</span>
          </motion.h2>
        </div>

        {/* Integrations Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-20 overflow-hidden"
        >
          <div className="flex gap-4 animate-marquee">
            {[...integrations, ...integrations].map((integration, index) => (
              <div
                key={index}
                className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-white/5 border border-white/10'
                    : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-2xl">{integration.icon}</span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{integration.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative rounded-2xl p-8 border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10'
                  : 'bg-white border-gray-200 hover:border-blue-500/50 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center"
        >
          <div className="relative z-10">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Build?
            </h3>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Tell us about your project. We'll get back with a proposal in 48 hours.
            </p>
            <a
              href="#submit-ticket"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Start a Project
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>

      {/* CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
