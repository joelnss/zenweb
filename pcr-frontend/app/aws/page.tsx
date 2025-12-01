'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/theme-context';

const services = [
  {
    title: 'Architecture & Systems Design',
    icon: '💡',
    description: 'End-to-end technical architecture for web, commerce, and internal systems.',
    features: [
      'Lightweight, high-performance frameworks with minimal dependencies',
      'Infrastructure planning that supports speed, stability, and future growth',
      'System blueprints designed for scalability from day one',
    ],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Application Development & Integration',
    icon: '🛠',
    description: 'Full-stack web applications built for performance and maintainability.',
    features: [
      'Custom integrations between platforms (ERP, CRM, eCommerce, APIs)',
      'Process automation to eliminate manual workflows',
      'Reduced operational cost through intelligent system design',
    ],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'API & Data Engineering',
    icon: '🔗',
    description: 'API design, implementation, and documentation for seamless connectivity.',
    features: [
      'Data modeling for scalable, predictable systems',
      'Secure, reliable pipelines for syncing products, customers, orders',
      'Analytics integration and real-time data processing',
    ],
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Platform Engineering',
    icon: '📦',
    description: 'Build & maintain custom modules, themes, and extensions.',
    features: [
      'Frontend, backend, and hosting layer optimization',
      'Platform stability under heavy load',
      'Performance tuning and caching strategies',
    ],
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Reliability, Security & Governance',
    icon: '🛡',
    description: 'Best-practice application security baked in from day one.',
    features: [
      'Monitoring, alerting, redundancy planning, and failover strategy',
      'Audit-ready system documentation',
      'Compliance alignment and security protocols',
    ],
    gradient: 'from-red-500 to-rose-500',
  },
  {
    title: 'Technical Leadership & Strategy',
    icon: '📊',
    description: 'Translate business needs into actionable technical roadmaps.',
    features: [
      'Evaluate new technologies for long-term viability',
      'Solutions with the smallest moving parts possible',
      'Lightweight, fast, and dependable architecture',
    ],
    gradient: 'from-indigo-500 to-violet-500',
  },
];

const process = [
  {
    step: '01',
    title: 'Discover & Analyze',
    description: 'Identify current systems, gaps, bottlenecks, and opportunities. Create a clear technical map of how everything connects.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Design the Architecture',
    description: 'Build a lightweight, scalable, and maintainable system design—no bloat, no noise. Just clean, efficient solutions.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Implement & Integrate',
    description: 'Develop applications, APIs, automations, and platform components. Ensure all services communicate cleanly and securely.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Optimize & Maintain',
    description: 'Monitor performance, reduce overhead, improve reliability, and refine the system as business needs evolve.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function AWSPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Elements */}
        {theme === 'dark' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
        )}

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'bg-orange-100 border border-orange-200 text-orange-600'
            }`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.75 3.94l-6.093 3.583c-.225.13-.473.197-.723.197H9.187c-.25 0-.498-.066-.723-.197L2.37 3.94A.47.47 0 002 4.35v7.3c0 .174.09.335.239.422l6.093 3.583c.225.13.473.197.723.197h2.89c.25 0 .498-.066.723-.197l6.093-3.583A.47.47 0 0019 11.65v-7.3a.47.47 0 00-.25-.41z"/>
              </svg>
              AWS Cloud Solutions
            </div>

            <h1 className={`text-4xl lg:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              High-Performance{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Digital Ecosystems
              </span>
            </h1>

            <p className={`text-xl mb-8 leading-relaxed max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Design, build, and manage scalable infrastructure that grows with your business—without unnecessary complexity or moving parts.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/start-project?service=aws"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                Start Your Project
              </Link>
              <Link
                href="/services"
                className={`px-8 py-4 font-semibold rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                View All Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              What We{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Do</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Comprehensive cloud architecture and engineering services tailored to your business needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group p-8 rounded-2xl border transition-all hover:shadow-xl ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:border-orange-500/30 hover:bg-white/10'
                    : 'bg-white border-gray-200 hover:border-orange-300 shadow-sm'
                }`}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.title}
                </h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className={`flex items-start gap-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              How We{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Work</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              A proven methodology that delivers results without unnecessary complexity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                {/* Connector Line */}
                {idx < process.length - 1 && (
                  <div className={`hidden lg:block absolute top-12 left-full w-full h-0.5 ${
                    theme === 'dark' ? 'bg-gradient-to-r from-orange-500/50 to-transparent' : 'bg-gradient-to-r from-orange-300 to-transparent'
                  }`} />
                )}

                <div className={`p-6 rounded-2xl border h-full ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {step.icon}
                  </div>
                  <div className={`text-sm font-bold mb-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                    Step {step.step}
                  </div>
                  <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className={`p-12 rounded-3xl border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20'
                : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
            }`}>
              <div className="text-center">
                <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  The Philosophy
                </h2>
                <blockquote className={`text-xl lg:text-2xl font-medium italic mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  &ldquo;Architect solutions with the smallest moving parts possible—
                  <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    lightweight, fast, dependable.
                  </span>&rdquo;
                </blockquote>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Every system is designed with simplicity at its core. No bloat, no unnecessary complexity—just clean,
                  efficient infrastructure that performs when it matters most.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '50%', label: 'Cost Reduction' },
              { value: '3x', label: 'Faster Deployment' },
              { value: '24/7', label: 'Monitoring' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Ready to Build Your{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Digital Ecosystem?
              </span>
            </h2>
            <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Let&apos;s discuss your infrastructure needs and create a solution that scales with your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/start-project?service=aws"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                Start a Conversation
              </Link>
              <Link
                href="/support"
                className={`px-8 py-4 font-semibold rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Get Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
