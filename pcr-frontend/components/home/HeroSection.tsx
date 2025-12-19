'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { slideInLeft, slideInRight } from '@/lib/animations/variants';
import { useTheme } from '@/lib/theme/theme-context';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  // Slide transition variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <section className={`relative min-h-[600px] flex items-center overflow-hidden ${
      theme === 'dark' ? 'bg-gray-950' : 'bg-white'
    }`}>
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          theme === 'dark'
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          theme === 'dark'
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index
                ? theme === 'dark' ? 'bg-white w-6' : 'bg-gray-900 w-6'
                : theme === 'dark' ? 'bg-white/30' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <AnimatePresence mode="wait" custom={currentSlide}>
          {currentSlide === 0 && (
            <motion.div
              key="slide-1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Slide 1: Left - Text Content */}
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
                href="/portal"
                className={`px-8 py-4 font-semibold rounded-lg transition-all duration-200 border ${
                  theme === 'dark'
                    ? 'bg-white/5 text-white hover:bg-white/10 border-white/10'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-200'
                }`}
              >
                Submit a Ticket
              </a>
            </div>

            {/* Platform Logos */}
            <div className="pt-6">
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Platforms we specialize in:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  <span>&lt;</span><AnimatedCounter end={2} duration={1} /><span>hr</span>
                </div>
                <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Avg Response</div>
              </motion.div>
              <motion.div
                className={`backdrop-blur-sm rounded-2xl p-6 border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                }`}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>&lt;</span><AnimatedCounter end={2} duration={0.8} /><span>.5s</span>
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
                  <AnimatedCounter end={2847} duration={2} />
                </div>
                <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Tickets Closed</div>
              </motion.div>
            </div>

              </motion.div>
            </motion.div>
          )}

          {currentSlide === 1 && (
            <motion.div
              key="slide-2"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Slide 2: Left - Security Audit Content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={slideInLeft}
                className="space-y-6"
              >
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  theme === 'dark' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  Security Services
                </div>

                <h1 className={`text-4xl lg:text-5xl font-bold leading-tight max-w-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Is your website{' '}
                  <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent italic">
                    actually
                  </span>{' '}
                  <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                    secure?
                  </span>
                </h1>

                <p className={`text-lg leading-relaxed max-w-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Protect your business with a comprehensive security audit. We identify vulnerabilities,
                  assess risks, and provide actionable recommendations to keep your data and customers safe.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    href="/portal?issue=security-audit"
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    Request Security Audit
                  </Link>
                  <a
                    href="/services"
                    className={`px-8 py-4 font-semibold rounded-lg transition-all duration-200 border ${
                      theme === 'dark'
                        ? 'bg-white/5 text-white hover:bg-white/10 border-white/10'
                        : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    Learn More
                  </a>
                </div>

                {/* Security Features */}
                <div className="pt-6">
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>What we check:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'SQL Injection',
                      'XSS Vulnerabilities',
                      'Authentication Flaws',
                      'Data Exposure',
                      'SSL/TLS Config',
                      'Access Controls',
                    ].map((item) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/10'
                            : 'bg-gray-100 border-gray-200'
                        }`}
                      >
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Slide 2: Right - Security Stats */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={slideInRight}
                className="relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark' ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AnimatedCounter end={43} suffix="%" duration={2} />
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>of sites have vulnerabilities</div>
                  </motion.div>
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-200 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      $<AnimatedCounter end={4} duration={1} />M+
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Avg breach cost</div>
                  </motion.div>
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AnimatedCounter end={24} suffix="hr" duration={0.8} />
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Audit Turnaround</div>
                  </motion.div>
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark' ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AnimatedCounter end={100} suffix="%" duration={2} />
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Confidential</div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {currentSlide === 2 && (
            <motion.div
              key="slide-3"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Slide 3: Left - POS Integration Content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={slideInLeft}
                className="space-y-6"
              >
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' : 'bg-purple-50 border border-purple-200 text-purple-600'
                }`}>
                  Payment Solutions
                </div>

                <h1 className={`text-4xl lg:text-5xl font-bold leading-tight max-w-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Seamless{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    POS integration
                  </span>{' '}
                  for your store.
                </h1>

                <p className={`text-lg leading-relaxed max-w-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Connect your online store with leading point-of-sale systems. Unified inventory,
                  real-time sync, and omnichannel selling made simple.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    href="/start-project?type=pos_integration"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    Get POS Integration
                  </Link>
                  <a
                    href="/services"
                    className={`px-8 py-4 font-semibold rounded-lg transition-all duration-200 border ${
                      theme === 'dark'
                        ? 'bg-white/5 text-white hover:bg-white/10 border-white/10'
                        : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    View Integrations
                  </a>
                </div>

                {/* POS Platform Logos */}
                <div className="pt-6">
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>POS systems we integrate:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Square */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                    }`}>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="#000"/>
                        <rect x="7" y="7" width="10" height="10" rx="1" fill="#fff"/>
                      </svg>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Square</span>
                    </div>
                    {/* Clover */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                    }`}>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="9" r="5" fill="#1DB954"/>
                        <circle cx="15" cy="9" r="5" fill="#1DB954"/>
                        <circle cx="9" cy="15" r="5" fill="#1DB954"/>
                        <circle cx="15" cy="15" r="5" fill="#1DB954"/>
                      </svg>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Clover</span>
                    </div>
                    {/* Shopify POS */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                    }`}>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M15.5 2.5L14 4l1.5 1.5L14 7l3 3 3-3-1.5-1.5L20 4l-1.5-1.5L20 1l-3 3-1.5-1.5z" fill="#96BF48"/>
                        <path d="M12 6L4 10v8l8 4 8-4v-8l-8-4z" fill="#5E8E3E"/>
                      </svg>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Shopify POS</span>
                    </div>
                    {/* Lightspeed */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                    }`}>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#E31937"/>
                        <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Lightspeed</span>
                    </div>
                    {/* Toast */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                    }`}>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="6" width="20" height="12" rx="2" fill="#FF6F00"/>
                        <path d="M6 10h12M6 14h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Toast</span>
                    </div>
                    {/* Vend */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                    }`}>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#00B0F0"/>
                        <path d="M7 12l3 4 7-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Vend</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Slide 3: Right - POS Stats */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={slideInRight}
                className="relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark' ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AnimatedCounter end={50} suffix="+" duration={2} />
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>POS Integrations</div>
                  </motion.div>
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark' ? 'bg-pink-500/5 border-pink-500/20' : 'bg-pink-50 border-pink-200 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AnimatedCounter end={100} suffix="%" duration={1.5} />
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Real-time Sync</div>
                  </motion.div>
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AnimatedCounter end={0} suffix=" errors" duration={0.5} />
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Inventory Mismatch</div>
                  </motion.div>
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark' ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200 shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <AnimatedCounter end={24} suffix="/7" duration={1} />
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Sync Monitoring</div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
