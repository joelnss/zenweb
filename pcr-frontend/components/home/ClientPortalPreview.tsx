'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/theme-context';

export default function ClientPortalPreview() {
  const { theme } = useTheme();

  return (
    <section className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-200 border border-gray-300 text-gray-600'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'}`} />
              Client Portal
            </div>

            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Manage Everything in{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">One Place</span>
            </h2>

            <p className={`text-lg mb-8 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your projects, submit support tickets, view invoices, and communicate with our team - all from your personalized dashboard. No more endless email chains or lost requests.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Real-time project status updates',
                'Priority support ticket system',
                'Invoice management & payment history',
                'Direct communication with your team',
              ].map((feature, idx) => (
                <li key={idx} className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                    <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Access Your Portal
              </Link>
              <Link
                href="/start-project"
                className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Start a Project
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className={`relative rounded-2xl overflow-hidden border shadow-2xl ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}>
              <Image
                src="/images/dashboard-preview.png"
                alt="Zenweb Client Portal Dashboard"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />

              {/* Decorative gradient overlay */}
              <div className={`absolute inset-0 pointer-events-none ${
                theme === 'dark'
                  ? 'bg-gradient-to-t from-gray-950/20 to-transparent'
                  : 'bg-gradient-to-t from-gray-50/20 to-transparent'
              }`} />
            </div>

            {/* Floating decorative elements */}
            <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl ${
              theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-200/50'
            }`} />
            <div className={`absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-2xl ${
              theme === 'dark' ? 'bg-gray-500/20' : 'bg-gray-300/50'
            }`} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
