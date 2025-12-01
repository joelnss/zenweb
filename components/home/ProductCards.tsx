'use client';

import { motion } from 'framer-motion';
import { staggerContainer, slideInUp } from '@/lib/animations/variants';
import Link from 'next/link';

interface ProductModule {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  color: string;
  gradientFrom: string;
  gradientTo: string;
  href: string;
  icon: string;
}

const modules: ProductModule[] = [
  {
    title: 'AssetHub',
    subtitle: 'Asset & Warranty Tracking',
    description:
      'Comprehensive asset management with real-time tracking, warranty monitoring, and automated alerts for upcoming expirations.',
    features: [
      'Real-time asset tracking',
      'Warranty expiration alerts',
      'QR code asset tagging',
      'Lifecycle management',
    ],
    color: 'blue',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-cyan-600',
    href: '/assethub',
    icon: '📦',
  },
  {
    title: 'ServiceHub',
    subtitle: 'Tickets, RMAs & Maintenance',
    description:
      'Streamline support operations with intelligent ticket routing, RMA processing, and preventive maintenance scheduling.',
    features: [
      'Smart ticket routing',
      'RMA workflow automation',
      'Maintenance scheduling',
      'SLA tracking & alerts',
    ],
    color: 'purple',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-pink-600',
    href: '/servicehub',
    icon: '🔧',
  },
  {
    title: 'QuoteHub',
    subtitle: 'Quotes, Configs & Pricing',
    description:
      'Generate professional quotes instantly with configurable products, dynamic pricing, and automated follow-up workflows.',
    features: [
      'Dynamic price calculator',
      'Product configurator',
      'Quote templates',
      'Email automation',
    ],
    color: 'green',
    gradientFrom: 'from-green-600',
    gradientTo: 'to-emerald-600',
    href: '/quotehub',
    icon: '💰',
  },
  {
    title: 'ContractHub',
    subtitle: 'Contracts & SLAs',
    description:
      'Manage contracts, track renewals, and ensure SLA compliance with automated reminders and performance dashboards.',
    features: [
      'Contract lifecycle mgmt',
      'Renewal notifications',
      'SLA monitoring',
      'Performance analytics',
    ],
    color: 'orange',
    gradientFrom: 'from-orange-600',
    gradientTo: 'to-red-600',
    href: '/contracthub',
    icon: '📄',
  },
];

export default function ProductCards() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Software built to transform your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              IT lifecycle management
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Choose the modules you need. Integrate with your existing tools. Scale as you grow.
          </motion.p>
        </div>

        {/* Product Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              variants={slideInUp}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                {/* Icon & Title */}
                <div className="mb-6">
                  <div className="text-5xl mb-4">{module.icon}</div>
                  <h3 className={`text-2xl font-bold bg-gradient-to-r ${module.gradientFrom} ${module.gradientTo} bg-clip-text text-transparent mb-2`}>
                    {module.title}
                  </h3>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {module.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {module.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {module.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 bg-gradient-to-r ${module.gradientFrom} ${module.gradientTo}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA - Currently disabled as requested */}
                <div className="pt-4 border-t border-gray-100">
                  <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${module.gradientFrom} ${module.gradientTo} bg-clip-text text-transparent cursor-not-allowed opacity-50`}>
                    Learn more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradientFrom} ${module.gradientTo} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
