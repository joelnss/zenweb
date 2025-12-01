'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/theme-context';

const capabilities = [
  { name: 'Shopify', category: 'eCommerce' },
  { name: 'Magento', category: 'eCommerce' },
  { name: 'Next.js', category: 'Framework' },
  { name: 'React', category: 'Framework' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'GraphQL', category: 'API' },
  { name: 'Stripe', category: 'Payments' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Vercel', category: 'Cloud' },
  { name: 'Contentful', category: 'CMS' },
  { name: 'Sanity', category: 'CMS' },
];

const stats = [
  { value: '50+', label: 'Projects Delivered' },
  { value: '<1s', label: 'Avg Load Time' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24h', label: 'Response Time' },
];

export default function ServicesDetail() {
  const { theme } = useTheme();

  return (
    <section className={`py-24 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Dot Pattern Background - Dark mode only */}
      {theme === 'dark' && (
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-services" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#6B7280" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-services)" />
          </svg>
        </div>
      )}

      {/* Animated floating gradient shapes - Dark mode only */}
      {theme === 'dark' && (
        <>
          <motion.div
            className="absolute -top-20 -right-20 w-80 h-80 bg-gray-600/10 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 60, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
      {theme === 'dark' && (
        <>
          <motion.div
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -50, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gray-600/10 rounded-full blur-3xl"
            animate={{
              x: [0, 70, 0],
              y: [0, 70, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </>
      )}


      <div className="container mx-auto px-6 relative z-10">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Full-Stack
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Expertise
              </span>
            </h2>
            <p className={`text-lg mb-8 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              We don't just write code—we architect solutions. From database design
              to deployment pipelines, every layer is built for performance and maintainability.
            </p>

            {/* CTA */}
            <a
              href="#submit-ticket"
              className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              Start a Project
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>

          {/* Right: Tech Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-3 gap-3">
              {capabilities.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className={`rounded-xl p-4 transition-all cursor-default ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tech.name}</div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{tech.category}</div>
                </motion.div>
              ))}
            </div>

            {/* Decorative element */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-3xl transform rotate-3" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
