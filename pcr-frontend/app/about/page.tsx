'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/lib/theme/theme-context';

const coreValues = [
  {
    title: 'Simplicity',
    description: 'We believe the best solutions are elegantly simple. No bloated code, no unnecessary complexity.',
  },
  {
    title: 'Performance',
    description: 'Speed isn\'t a feature—it\'s the foundation. Every line of code is optimized for maximum efficiency.',
  },
  {
    title: 'Transparency',
    description: 'No hidden fees, no surprise timelines. You\'ll always know exactly where your project stands.',
  },
  {
    title: 'Partnership',
    description: 'We\'re not just vendors. We invest in your success and grow alongside your business.',
  },
  {
    title: 'Excellence',
    description: 'Good enough isn\'t. We hold ourselves to the highest standards in everything we deliver.',
  },
];

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background Orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 0],
            y: [0, -70, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              About Zenweb
            </div>
            <h1 className={`text-5xl lg:text-7xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              We Build{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Fast</span>,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Lean</span>,{' '}
              and{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Scalable</span>
            </h1>
            <p className={`text-xl mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              We're not your typical agency. We're engineers who believe that great software should be invisible—fast, reliable, and out of your way.
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Proudly Built in Michigan
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className={`py-24 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Dot Pattern Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-about" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#60A5FA" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-about)" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-lime-400 to-green-400 rounded-2xl p-12 text-center">
                  <div className="text-7xl font-bold text-gray-900 mb-2">15+</div>
                  <div className="text-xl font-semibold text-gray-800">Years Building eCommerce</div>
                </div>
                {/* Floating dots */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-6 h-6 bg-cyan-400 rounded-full"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Less Code. More Impact.
              </h2>
              <p className={`text-lg leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Every line of code we write has a purpose. We don't pad timelines, we don't over-engineer, and we definitely don't ship bloated solutions. Our philosophy is simple: build exactly what you need, nothing more, nothing less.
              </p>
              <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                After 15 years of working with <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Magento</span>, <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Shopware</span>, <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Shopify</span>, and custom builds, we've learned that the best software is the kind you don't have to think about—it just works.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className={`py-24 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <motion.div
          className="absolute top-1/4 -right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No Fluff. No BS.
              </h2>
              <p className={`text-lg leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                We've worked with agencies that charge for meetings about meetings. That's not us. When you work with Zenweb, you get direct access to the people building your project. No account managers, no middlemen, no runaround.
              </p>
              <div className="space-y-4">
                <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Direct communication with developers</span>
                </div>
                <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Transparent pricing, no surprises</span>
                </div>
                <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Real-time project tracking</span>
                </div>
                <div className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Code you actually own</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">400+</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Projects Delivered</div>
              </div>
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-4xl font-bold bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent mb-2">&lt;1s</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Avg Load Time</div>
              </div>
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">99.9%</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Uptime SLA</div>
              </div>
              <div className={`rounded-2xl p-6 border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">24/7</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Support Available</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hosting & Technical Specs */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl lg:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enterprise-Grade <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Infrastructure</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              We don't just build your site—we host it on infrastructure designed for speed, security, and scale.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Uptime SLA', value: '99.99%' },
              { label: 'Global Edge Locations', value: '300+' },
              { label: 'Avg Response Time', value: '<200ms' },
              { label: 'DDoS Protection', value: '10Tbps+' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`text-center p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Infrastructure Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`p-8 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Infrastructure</h3>
              <ul className="space-y-4">
                {[
                  'Auto-scaling Kubernetes clusters',
                  'Multi-region redundancy',
                  'Global CDN with edge caching',
                  'Automated daily backups',
                  'SSL/TLS certificates included',
                  'Real-time monitoring & alerts',
                ].map((item) => (
                  <li key={item} className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <svg className="w-5 h-5 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Security Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`p-8 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Security</h3>
              <ul className="space-y-4">
                {[
                  'SOC 2 Type II compliant',
                  'Enterprise DDoS mitigation',
                  'Web Application Firewall (WAF)',
                  'Automated vulnerability scanning',
                  'Encrypted data at rest & in transit',
                  'Role-based access controls',
                ].map((item) => (
                  <li key={item} className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <svg className="w-5 h-5 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-12"
          >
            <Link
              href="/hosting"
              className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              Learn More About Hosting
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className={`py-24 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          className="absolute top-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className={`text-4xl lg:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              What We{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Stand For</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`backdrop-blur-sm rounded-xl p-6 border transition-all hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 border-white/10 hover:border-blue-500/50 hover:bg-slate-800/80'
                    : 'bg-white border-gray-200 hover:border-blue-500/50 shadow-sm'
                }`}
              >
                <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value.title}</h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Michigan Section */}
      <section className={`py-24 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-6 ${
                theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Michigan Roots
              </div>
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Built in the{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Great Lakes State</span>
              </h2>
              <p className={`text-lg leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                We're proud to call Michigan home. Like the automotive industry that built this state, we believe in engineering excellence, hard work, and building things that last.
              </p>
              <p className={`text-lg leading-relaxed mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                From Detroit's manufacturing legacy to the tech hubs emerging across the state, Michigan has always been about innovation. We carry that same spirit into every project we build—craftsmanship, reliability, and a no-nonsense approach to getting the job done right.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Local Support, Global Reach</span>
                </div>
                <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Midwestern Work Ethic</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Michigan-themed decorative element */}
              <div className={`relative rounded-2xl p-8 border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-48 h-56 mx-auto" viewBox="0 0 200 240" fill="none">
                      {/* Michigan Mitten Outline */}
                      <path
                        d="M95 20 L105 15 L115 12 L125 10 L135 12 L145 18 L150 25 L155 35 L158 45 L160 55 L158 65 L155 75 L150 85 L145 95 L140 105 L135 115 L130 130 L125 145 L120 160 L115 175 L108 190 L100 200 L90 205 L80 200 L70 190 L62 175 L55 160 L50 145 L48 130 L50 115 L55 100 L60 85 L65 70 L70 55 L75 45 L80 35 L85 25 L90 20 Z"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Thumb (Upper Peninsula style) */}
                      <path
                        d="M145 18 L155 12 L165 8 L175 10 L180 18 L178 28 L172 35 L165 40 L158 45"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Blue dots scattered across Michigan */}
                      <circle cx="100" cy="60" r="4" fill="#3B82F6" />
                      <circle cx="120" cy="45" r="3" fill="#60A5FA" />
                      <circle cx="80" cy="55" r="3" fill="#60A5FA" />
                      <circle cx="110" cy="80" r="4" fill="#3B82F6" />
                      <circle cx="90" cy="90" r="3" fill="#60A5FA" />
                      <circle cx="130" cy="70" r="3" fill="#60A5FA" />
                      <circle cx="100" cy="110" r="4" fill="#3B82F6" />
                      <circle cx="115" cy="130" r="3" fill="#60A5FA" />
                      <circle cx="85" cy="125" r="3" fill="#60A5FA" />
                      <circle cx="95" cy="150" r="4" fill="#3B82F6" />
                      <circle cx="105" cy="170" r="3" fill="#60A5FA" />
                      <circle cx="75" cy="100" r="3" fill="#60A5FA" />
                      <circle cx="125" cy="100" r="3" fill="#60A5FA" />
                      {/* Thumb area dots */}
                      <circle cx="165" cy="20" r="3" fill="#60A5FA" />
                      <circle cx="170" cy="30" r="2" fill="#3B82F6" />
                      {/* HQ marker - larger dot */}
                      <circle cx="100" cy="140" r="6" fill="#3B82F6" />
                      <circle cx="100" cy="140" r="3" fill="white" />
                    </svg>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Serving Clients Nationwide
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Headquartered in Michigan, delivering excellence everywhere
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">50+</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>States Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">100%</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Remote-Friendly</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Build Something Great?
              </h3>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Let's skip the sales pitch and talk about what you actually need.
              </p>
              <Link
                href="/start-project"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Start a Project
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
