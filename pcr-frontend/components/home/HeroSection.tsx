'use client';

import { motion, useInView } from 'framer-motion';
import { slideInLeft, slideInRight } from '@/lib/animations/variants';
import { useTheme } from '@/lib/theme/theme-context';
import { useEffect, useState, useRef } from 'react';

// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export default function HeroSection() {
  const { theme } = useTheme();

  return (
    <section className={`relative min-h-[600px] flex items-center overflow-hidden ${
      theme === 'dark' ? 'bg-gray-950' : 'bg-white'
    }`}>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
            className="space-y-6"
          >
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              theme === 'dark' ? 'bg-white/5 border border-white/10 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'
            }`}>
              Enterprise Web Development
            </div>

            <h1 className={`text-4xl lg:text-5xl font-bold leading-tight max-w-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Velocity belongs to the{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                uncluttered machine.
              </span>
            </h1>

            <p className={`text-lg leading-relaxed max-w-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Full-stack development, system integrations, and cloud infrastructure.
              From eCommerce platforms to custom web applications—we architect
              solutions that perform and scale.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="/start-project"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Start a Project
              </a>
              <a
                href="#services"
                className={`px-8 py-4 font-semibold rounded-lg transition-all duration-200 border ${
                  theme === 'dark'
                    ? 'bg-white/5 text-white hover:bg-white/10 border-white/10'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-200'
                }`}
              >
                View Services
              </a>
            </div>

            {/* Platform Logos */}
            <div className="pt-6">
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Platforms we specialize in:</p>
              <div className="grid grid-cols-3 gap-3">
                {/* Magento */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                }`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#F26322"/>
                    <path d="M12 2v20M2 7l10 5 10-5" stroke="#fff" strokeWidth="1.5"/>
                  </svg>
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Magento</span>
                </div>
                {/* Shopware */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                }`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#189EFF"/>
                    <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Shopware</span>
                </div>
                {/* BigCommerce */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                }`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="#121118"/>
                    <path d="M7 8h10M7 12h8M7 16h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>BigCommerce</span>
                </div>
                {/* Shopify */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                }`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M15.5 2.5L14 4l1.5 1.5L14 7l3 3 3-3-1.5-1.5L20 4l-1.5-1.5L20 1l-3 3-1.5-1.5z" fill="#96BF48"/>
                    <path d="M12 6L4 10v8l8 4 8-4v-8l-8-4z" fill="#5E8E3E"/>
                    <path d="M12 6v16M4 10l8 4 8-4" stroke="#fff" strokeWidth="0.5"/>
                  </svg>
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Shopify</span>
                </div>
                {/* WooCommerce */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                }`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="3" fill="#96588A"/>
                    <path d="M6 10c0 1.5.8 3 2 3s2-1.5 2-3M10 10c0 1.5.8 3 2 3s2-1.5 2-3M14 10c0 1.5.8 3 2 3s2-1.5 2-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>WooCommerce</span>
                </div>
                {/* WordPress */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                }`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#21759B"/>
                    <path d="M3.5 12l5.5 7 2-6M12 22l3-9h3.5M20.5 12l-4-6-2 6M12 2l-3 9H5.5" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>WordPress</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Stats/Features */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className={`backdrop-blur-sm rounded-2xl p-6 border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                }`}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <AnimatedCounter end={99} suffix=".9%" duration={2} />
                </div>
                <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Uptime SLA</div>
              </motion.div>
              <motion.div
                className={`backdrop-blur-sm rounded-2xl p-6 border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                }`}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <AnimatedCounter end={50} suffix="+" duration={1.8} />
                </div>
                <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Integrations</div>
              </motion.div>
              <motion.div
                className={`backdrop-blur-sm rounded-2xl p-6 border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                }`}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>&lt;</span><AnimatedCounter end={1} duration={0.8} /><span>s</span>
                </div>
                <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Load Times</div>
              </motion.div>
              <motion.div
                className={`backdrop-blur-sm rounded-2xl p-6 border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                }`}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <AnimatedCounter end={24} duration={1.5} /><span>/</span><AnimatedCounter end={7} duration={1} />
                </div>
                <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Support</div>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
