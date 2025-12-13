'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/theme-context';

const projects = [
  {
    title: 'PC Server and Parts',
    url: 'https://pcserverandparts.com',
    category: 'Custom E-Commerce Platform',
    image: '/projects/pcserverandparts.jpg',
    gradient: 'from-blue-600 to-cyan-500',
    challenge: 'A leading IT hardware reseller needed a robust e-commerce solution capable of handling thousands of SKUs, real-time inventory management, and complex B2B pricing structures that off-the-shelf platforms couldn\'t accommodate.',
    solution: 'We engineered a fully custom e-commerce platform from the ground up, featuring an intelligent product catalog system with advanced filtering, dynamic pricing tiers for wholesale and retail customers, and seamless integration with their existing inventory management systems.',
    features: [
      'Custom product catalog with multi-attribute filtering',
      'Dynamic B2B/B2C pricing engine',
      'Real-time inventory synchronization',
      'Automated quote generation system',
      'Secure payment processing with multiple gateway support',
      'Mobile-responsive storefront design',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    title: 'Eat Local Macomb',
    url: 'https://eatlocalmacomb.com',
    category: 'Event Planning & Community Platform',
    image: '/projects/eatlocalmacomb.jpg',
    gradient: 'from-green-500 to-emerald-500',
    challenge: 'A grassroots community organization promoting local food systems needed a centralized hub to coordinate events, connect local farmers with consumers, and build an engaged community around sustainable food practices.',
    solution: 'We developed an all-in-one community management platform that serves as the digital heartbeat of the local food movement. The system features an intuitive event management suite with RSVP tracking, vendor registration portals, and community engagement tools.',
    features: [
      'Comprehensive event calendar with registration management',
      'Vendor portal with application workflows',
      'Community member directory and engagement tools',
      'Newsletter integration and automated communications',
      'Interactive maps for market locations',
      'Social sharing and community feed functionality',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Micropure Water',
    url: 'https://micropurewater.com',
    category: 'Dynamic Business Website',
    image: '/projects/micropurewater.jpg',
    gradient: 'from-cyan-500 to-blue-500',
    challenge: 'A water purification company required a professional digital presence that could effectively communicate complex technical information about their filtration systems while generating qualified leads for their sales team.',
    solution: 'We crafted a dynamic, conversion-focused website that balances technical credibility with approachable design. The site features interactive product showcases and a sophisticated lead capture system with intelligent routing.',
    features: [
      'Dynamic content management system',
      'Interactive product comparison tools',
      'Multi-step lead capture forms with CRM integration',
      'SEO-optimized architecture and content structure',
      'Performance-tuned for Core Web Vitals',
      'Mobile-first responsive design',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    title: 'Sterling Millwork',
    url: 'https://sterlingmillwork.com',
    category: 'Dynamic Business Website',
    image: '/projects/sterlingmillwork.jpg',
    gradient: 'from-amber-500 to-orange-500',
    challenge: 'A premier architectural millwork company needed a digital showcase that could capture the craftsmanship and artistry of their custom woodwork while streamlining the inquiry process for architects, designers, and homeowners.',
    solution: 'We designed an elegant, visually-driven website that lets the stunning portfolio speak for itself. High-resolution project galleries with categorized filtering allow visitors to explore work by project type, material, or style.',
    features: [
      'Immersive portfolio gallery with lightbox viewing',
      'Advanced project categorization and filtering',
      'Custom quote request workflow',
      'Optimized image delivery for fast loading',
      'Content management for easy portfolio updates',
      'Integration with project management tools',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Greener Pastures Market',
    url: 'https://greenerpasturesmarket.com',
    category: 'Custom E-Commerce + Mobile App',
    image: '/projects/greenerpastures.jpg',
    gradient: 'from-green-600 to-teal-500',
    challenge: 'A farm-to-table market needed more than a website—they required a complete digital ecosystem that could handle online ordering, subscription boxes, delivery logistics, and customer engagement across both web and mobile platforms.',
    solution: 'We delivered a comprehensive omnichannel commerce solution featuring a custom-built e-commerce platform paired with native mobile applications for iOS and Android. The system supports complex product configurations including subscription-based farm boxes.',
    features: [
      'Custom e-commerce platform with subscription management',
      'Native iOS and Android mobile applications',
      'Variable-weight product handling and dynamic pricing',
      'Delivery zone management and route optimization',
      'Push notification system for promotions and updates',
      'Customer loyalty and rewards program',
    ],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function OurWorkPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-gray-300/30'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-purple-600/10' : 'bg-gray-400/20'}`} style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark' ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-200 border border-gray-300 text-gray-600'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'}`} />
              Featured Projects
            </div>
            <h1 className={`text-5xl lg:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Our <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Work</span>
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Real solutions for real businesses. From custom e-commerce platforms to community management systems—
              explore the digital experiences we've crafted for our clients.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative pb-20">
        <div className="container mx-auto px-6">
          <div className="space-y-16">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative rounded-3xl border overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-gray-200 shadow-lg'
                }`}
              >
                {/* Gradient accent bar */}
                <div className={`h-1 bg-gradient-to-r ${project.gradient}`} />

                <div className="p-8 lg:p-12">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${project.gradient} text-white`}>
                        {project.icon}
                      </div>
                      <div>
                        <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                          {project.category}
                        </div>
                        <h2 className={`text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {project.title}
                        </h2>
                      </div>
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105 ${
                        theme === 'dark'
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      Visit Site
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {/* Content Grid */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Challenge & Solution */}
                    <div className="space-y-6">
                      <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          The Challenge
                        </h3>
                        <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {project.challenge}
                        </p>
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Our Solution
                        </h3>
                        <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {project.solution}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Key Features
                      </h3>
                      <ul className="space-y-3">
                        {project.features.map((feature, idx) => (
                          <li key={idx} className={`flex items-start gap-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`rounded-3xl p-8 lg:p-12 ${
              theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'
            }`}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: '50+', label: 'Projects Delivered' },
                { value: '5+', label: 'Years Experience' },
                { value: '99.9%', label: 'Uptime Guarantee' },
                { value: '24/7', label: 'Support Available' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative overflow-hidden rounded-3xl p-12 text-center ${
              theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10' : 'bg-gray-900'
            }`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Let's discuss your project. Whether you need a custom e-commerce platform, a dynamic website,
                or a mobile app—we're here to bring your vision to life.
              </p>
              <Link
                href="/start-project"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105"
              >
                Start Your Project
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
