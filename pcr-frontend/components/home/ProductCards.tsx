'use client';

import { motion } from 'framer-motion';
import { staggerContainer, slideInUp } from '@/lib/animations/variants';
import { useTheme } from '@/lib/theme/theme-context';

const services = [
  {
    number: '01',
    title: 'Submit',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    items: ['Project request', 'Support ticket', 'Quick forms'],
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    number: '02',
    title: 'Track',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    items: ['Live dashboard', 'Status updates', 'Progress timeline'],
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    number: '03',
    title: 'Communicate',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    items: ['Real-time chat', 'Direct support', 'File sharing'],
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    number: '04',
    title: 'Deliver',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    items: ['Fast turnaround', 'Quality assured', 'Ongoing support'],
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const techLogos = [
  { name: 'Next.js', color: 'bg-black' },
  { name: 'React', color: 'bg-sky-500' },
  { name: 'Node', color: 'bg-green-600' },
  { name: 'TypeScript', color: 'bg-blue-600' },
  { name: 'AWS', color: 'bg-orange-500' },
  { name: 'Shopify', color: 'bg-green-500' },
];

export default function ProductCards() {
  const { theme } = useTheme();

  return (
    <section className={`py-24 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`} id="services">
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-600'
            }`}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Our Process
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-4xl lg:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            How We Work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Our interactive support system keeps you connected every step of the way
          </motion.p>

          {/* New Projects Section */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className={`text-2xl font-bold mt-12 mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            New Projects
          </motion.h3>

          {/* Process Illustration - HTML Version */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Connecting Line */}
              <div className={`hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 ${
                theme === 'dark' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500' : 'bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400'
              }`} style={{ zIndex: 0 }} />

              {/* Step 1 - Discovery */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
                  theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500'
                } shadow-lg shadow-blue-500/30`}>
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Discovery</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Research & Plan</span>
              </div>

              {/* Step 2 - Design */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
                  theme === 'dark' ? 'bg-purple-500' : 'bg-purple-500'
                } shadow-lg shadow-purple-500/30`}>
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Design</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>UI/UX & Prototype</span>
              </div>

              {/* Step 3 - Develop */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
                  theme === 'dark' ? 'bg-pink-500' : 'bg-pink-500'
                } shadow-lg shadow-pink-500/30`}>
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Develop</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Build & Test</span>
              </div>

              {/* Step 4 - Deploy */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
                  theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-500'
                } shadow-lg shadow-cyan-500/30`}>
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Deploy</span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Launch & Support</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* New Ticket Process Heading */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`text-2xl font-bold mt-16 mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          New Ticket Process
        </motion.h3>

        {/* Process Cards - Horizontal on desktop */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              variants={slideInUp}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className={`relative h-full backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
              }`}>
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* Number badge */}
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${service.gradient} text-white mb-4`}>
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {service.title}
                </h3>

                {/* Items */}
                <ul className="space-y-2">
                  {service.items.map((item, i) => (
                    <li key={i} className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${service.gradient}`} />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Step number */}
                <div className={`absolute bottom-4 right-4 text-5xl font-bold transition-colors ${
                  theme === 'dark' ? 'text-white/5 group-hover:text-white/10' : 'text-gray-100 group-hover:text-gray-200'
                }`}>
                  {service.number}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Built with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {techLogos.map((tech) => (
              <div
                key={tech.name}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${tech.color}`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{tech.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
