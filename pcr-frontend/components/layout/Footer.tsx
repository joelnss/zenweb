'use client';

import Link from 'next/link';
import { useTheme } from '@/lib/theme/theme-context';

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="footer-z-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4fe7f3" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#8c5eff" stopOpacity="0.3"/>
                    </linearGradient>
                    <linearGradient id="footer-z-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4fe7f3" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#8c5eff" stopOpacity="0.6"/>
                    </linearGradient>
                    <linearGradient id="footer-z-grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4fe7f3"/>
                      <stop offset="50%" stopColor="#8c5eff"/>
                      <stop offset="100%" stopColor="#c938e7"/>
                    </linearGradient>
                  </defs>
                  <path d="M5 7h14v2H10l9 6v2H5v-2h9L5 9V7z" fill="url(#footer-z-grad1)"/>
                  <path d="M8 11h14v2H13l9 6v2H8v-2h9L8 13V11z" fill="url(#footer-z-grad2)"/>
                  <path d="M11 15h14v2H16l9 6v2H11v-2h9l-9-6v-2z" fill="url(#footer-z-grad3)"/>
                </svg>
              </div>
              <div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Zenweb</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>High Performance eCommerce</div>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Full-stack web development, eCommerce platforms, and system integrations.
              We build scalable digital solutions that drive business growth.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Services</h3>
            <ul className="space-y-2 text-sm">
              <li><span className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}>eCommerce Development</span></li>
              <li><span className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}>Web Applications</span></li>
              <li><span className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}>API Integrations</span></li>
              <li><span className={`transition-colors cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}>Cloud Hosting</span></li>
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Technologies</h3>
            <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>Next.js & React</li>
              <li>Node.js & TypeScript</li>
              <li>Shopify & Magento</li>
              <li>AWS & Vercel</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}`}>
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/start-project"
                  className="inline-block px-4 py-2 mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  Start a Project
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm ${
          theme === 'dark' ? 'border-gray-800 text-gray-400' : 'border-gray-300 text-gray-500'
        }`}>
          <p>&copy; {new Date().getFullYear()} Zenweb. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="cursor-not-allowed opacity-50">Privacy Policy</span>
            <span className="cursor-not-allowed opacity-50">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
