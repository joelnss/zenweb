'use client';

import { motion } from 'framer-motion';
import SupportTicketForm from '@/components/portal/SupportTicketForm';
import Link from 'next/link';
import { useTheme } from '@/lib/theme/theme-context';

export default function CustomerPortal() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-300/30'}`}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-400/20'}`}
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-200 border border-gray-300 text-gray-600'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'}`} />
              Customer Support Portal
            </div>
            <h1 className={`text-4xl lg:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Submit a Support Ticket
            </h1>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Use our support portal to report issues or request help.<br />
              We're here to assist with anything related to your website.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Form */}
      <section className="pb-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <SupportTicketForm />
          </div>

          {/* Help Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className={`rounded-2xl p-8 border ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Need Immediate Help?</h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    For critical issues or site emergencies, our team is available for priority support.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/start-project"
                      className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-white text-gray-900 hover:bg-gray-100'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      Start New Project
                    </Link>
                    <a
                      href="mailto:support@webdevstudio.com"
                      className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      Email Us
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-xl p-4 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>4h</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Critical Response</div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>24h</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Standard Response</div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>99.9%</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Resolution Rate</div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>24/7</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
