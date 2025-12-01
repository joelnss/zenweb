'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                PC
              </div>
              <div>
                <div className="text-lg font-bold text-white">P.C. Resource</div>
                <div className="text-xs text-gray-400">IT Services</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Full service computer company offering low cost computing alternatives with
              quality products and expert support.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-not-allowed opacity-50">AssetHub</span></li>
              <li><span className="cursor-not-allowed opacity-50">ServiceHub</span></li>
              <li><span className="cursor-not-allowed opacity-50">QuoteHub</span></li>
              <li><span className="cursor-not-allowed opacity-50">ContractHub</span></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-not-allowed opacity-50">About Us</span></li>
              <li><span className="cursor-not-allowed opacity-50">Contact</span></li>
              <li><span className="cursor-not-allowed opacity-50">Careers</span></li>
              <li><span className="cursor-not-allowed opacity-50">Blog</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href="mailto:sales@buypcr.com" className="hover:text-white transition-colors">
                  sales@buypcr.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href="tel:810-874-2069" className="hover:text-white transition-colors">
                  810-874-2069
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} P.C. Resource IT Services. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="cursor-not-allowed opacity-50">Privacy Policy</span>
            <span className="cursor-not-allowed opacity-50">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
