'use client';

import { motion } from 'framer-motion';
import TicketForm from '@/components/home/TicketForm';
import Link from 'next/link';
import { useTheme } from '@/lib/theme/theme-context';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function StartProjectContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const preSelectedService = searchParams.get('service');

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Animated Background - Dark mode only */}
      {theme === 'dark' && (
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl bg-gray-600/10"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl bg-gray-500/10"
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl bg-gray-700/10"
            animate={{
              x: [0, 40, 0],
              y: [0, -40, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
      )}

      {/* Hero Section - Compact */}
      <section className="relative pt-8 pb-4 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Start Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Project</span>
            </h1>
            <p className={`text-base max-w-xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Tell us about your project and we'll craft a custom solution.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Form */}
      <section className="pb-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <TicketForm preSelectedService={preSelectedService} />
          </div>

          {/* Info Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className={`rounded-2xl p-8 border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-white/10'
                : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
            }`}>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>What Happens Next?</h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    After you submit your project request, our team will review your requirements and get back to you with a detailed proposal within 24-48 hours.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/portal"
                      className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      Need Support Instead?
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-xl p-4 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>24-48h</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Proposal Time</div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Free</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Consultation</div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>400+</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Projects Delivered</div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>15+</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Years Experience</div>
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

export default function StartProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <StartProjectContent />
    </Suspense>
  );
}
