'use client';

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

          {/* Dashboard Mockup - CSS Based */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className={`relative rounded-2xl overflow-hidden border shadow-2xl ${
              theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              {/* Dashboard Header */}
              <div className={`px-4 py-3 border-b flex items-center justify-between ${
                theme === 'dark' ? 'bg-gray-800/50 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className={`text-sm font-medium ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Zenweb Client Portal Dashboard
                  </span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Active Projects</div>
                    <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>3</div>
                    <div className="text-xs text-green-500">+1 this week</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Open Tickets</div>
                    <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>2</div>
                    <div className="text-xs text-blue-500">In progress</div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Invoices</div>
                    <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>$4.2k</div>
                    <div className="text-xs text-cyan-500">All paid</div>
                  </div>
                </div>

                {/* Project Progress */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                  <div className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Project Progress</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>E-commerce Redesign</span>
                        <span className="text-cyan-500">75%</span>
                      </div>
                      <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>API Integration</span>
                        <span className="text-cyan-500">40%</span>
                      </div>
                      <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                  <div className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Activity</div>
                  <div className="space-y-2">
                    {[
                      { action: 'Ticket #142 resolved', time: '2h ago', color: 'text-green-500' },
                      { action: 'New invoice generated', time: '5h ago', color: 'text-blue-500' },
                      { action: 'Project milestone completed', time: '1d ago', color: 'text-cyan-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.action}</span>
                        </div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
